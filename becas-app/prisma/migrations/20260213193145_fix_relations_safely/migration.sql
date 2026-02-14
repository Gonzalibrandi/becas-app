/*
  MIGRACIÓN SEGURA (CORREGIDA MANUALMENTE)
  Objetivo: Renombrar columna y relaciones sin perder datos.
*/

-- 1. CAMBIO DE NOMBRE DE LA COLUMNA (duracion -> duration)
-- En lugar de borrar y crear, renombramos para conservar el texto existente.
ALTER TABLE "scholarships" RENAME COLUMN "duracion" TO "duration";

-- Opcional: Aseguramos que el valor por defecto sea '' como pide el nuevo esquema
ALTER TABLE "scholarships" ALTER COLUMN "duration" SET DEFAULT '';
ALTER TABLE "scholarships" ALTER COLUMN "duration" SET NOT NULL;


-- 2. LIMPIEZA DE CLAVES FORÁNEAS ANTIGUAS
-- Esto es necesario para poder manipular las tablas viejas
ALTER TABLE "_CategoryToScholarship" DROP CONSTRAINT "_CategoryToScholarship_A_fkey";
ALTER TABLE "_CategoryToScholarship" DROP CONSTRAINT "_CategoryToScholarship_B_fkey";

ALTER TABLE "_CountryToScholarship" DROP CONSTRAINT "_CountryToScholarship_A_fkey";
ALTER TABLE "_CountryToScholarship" DROP CONSTRAINT "_CountryToScholarship_B_fkey";


-- 3. CREACIÓN DE LAS NUEVAS TABLAS (Con los nuevos nombres)
CREATE TABLE "_ScholarshipCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE TABLE "_ScholarshipCountries" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);


-- 4. ¡PASO CRÍTICO! COPIAR LOS DATOS DE LAS TABLAS VIEJAS A LAS NUEVAS
INSERT INTO "_ScholarshipCategories" ("A", "B")
SELECT "A", "B" FROM "_CategoryToScholarship";

INSERT INTO "_ScholarshipCountries" ("A", "B")
SELECT "A", "B" FROM "_CountryToScholarship";


-- 5. CREACIÓN DE ÍNDICES EN LAS NUEVAS TABLAS
CREATE UNIQUE INDEX "_ScholarshipCategories_AB_unique" ON "_ScholarshipCategories"("A", "B");
CREATE INDEX "_ScholarshipCategories_B_index" ON "_ScholarshipCategories"("B");

CREATE UNIQUE INDEX "_ScholarshipCountries_AB_unique" ON "_ScholarshipCountries"("A", "B");
CREATE INDEX "_ScholarshipCountries_B_index" ON "_ScholarshipCountries"("B");


-- 6. CREACIÓN DE LAS NUEVAS CLAVES FORÁNEAS (Relaciones)
ALTER TABLE "_ScholarshipCategories" ADD CONSTRAINT "_ScholarshipCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ScholarshipCategories" ADD CONSTRAINT "_ScholarshipCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ScholarshipCountries" ADD CONSTRAINT "_ScholarshipCountries_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ScholarshipCountries" ADD CONSTRAINT "_ScholarshipCountries_B_fkey" FOREIGN KEY ("B") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- 7. AHORA SÍ, BORRAR LAS TABLAS VIEJAS (Ya están vacías de utilidad)
DROP TABLE "_CategoryToScholarship";
DROP TABLE "_CountryToScholarship";