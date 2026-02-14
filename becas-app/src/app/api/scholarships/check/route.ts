import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/admin';

// POST /api/scholarships/check - check existing scholarships
// Body: { urls: string[], titles: string[] }
// Returns: { existingUrls: string[], existingSlugs: string[] }
export async function POST(request: NextRequest) {
  // 1. Auth Check
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return auth.errorResponse;
  }

  try {
    const { urls, titles } = await request.json();

    if (!urls && !titles) {
      return NextResponse.json({ error: 'Provide urls or titles' }, { status: 400 });
    }

    // 2. Check by URL (sourceUrl or applyUrl)
    const existingUrlsSet = new Set<string>();
    
    if (urls && Array.isArray(urls) && urls.length > 0) {
      // Build a map of variations -> original query URL
      // usage: variationMap.get('http://site.com/') -> 'http://site.com'
      const variationMap = new Map<string, string>();
      const allVariations: string[] = [];

      urls.forEach(u => {
        if (!u) return;
        // precise match
        variationMap.set(u, u);
        allVariations.push(u);

        // trailing slash variation
        let variation: string;
        if (u.endsWith('/')) {
            variation = u.slice(0, -1);
        } else {
            variation = u + '/';
        }
        variationMap.set(variation, u);
        allVariations.push(variation);
      });

      // Query DB with all variations
      const foundBySource = await prisma.scholarship.findMany({
        where: { sourceUrl: { in: allVariations } },
        select: { sourceUrl: true }
      });
      
      foundBySource.forEach(s => {
        if (s.sourceUrl && variationMap.has(s.sourceUrl)) {
            existingUrlsSet.add(variationMap.get(s.sourceUrl)!);
        }
      });

      const foundByApply = await prisma.scholarship.findMany({
        where: { applyUrl: { in: allVariations } },
        select: { applyUrl: true }
      });
      
      foundByApply.forEach(s => {
        if (s.applyUrl && variationMap.has(s.applyUrl)) {
            existingUrlsSet.add(variationMap.get(s.applyUrl)!);
        }
      });
    }

    // 3. Check by Title (generating slugs or partial match might be too heavy)
    // We'll check exact title match for now
    const existingTitlesSet = new Set<string>();
    if (titles && Array.isArray(titles) && titles.length > 0) {
      const foundByTitle = await prisma.scholarship.findMany({
        where: { title: { in: titles } },
        select: { title: true }
      });
      foundByTitle.forEach(s => existingTitlesSet.add(s.title));
    }

    return NextResponse.json({
      existingUrls: Array.from(existingUrlsSet),
      existingTitles: Array.from(existingTitlesSet)
    });

  } catch (error) {
    console.error('Check Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
