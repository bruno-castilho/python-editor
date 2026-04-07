-- CreateTable
CREATE TABLE "_SharedWithMeProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SharedWithMeProjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SharedWithMeProjects_B_index" ON "_SharedWithMeProjects"("B");

-- AddForeignKey
ALTER TABLE "_SharedWithMeProjects" ADD CONSTRAINT "_SharedWithMeProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWithMeProjects" ADD CONSTRAINT "_SharedWithMeProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
