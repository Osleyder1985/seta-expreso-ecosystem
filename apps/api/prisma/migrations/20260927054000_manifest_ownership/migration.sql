ALTER TABLE "Manifest" ADD COLUMN "ownerSubject" TEXT;

CREATE INDEX "Manifest_ownerSubject_idx" ON "Manifest"("ownerSubject");
