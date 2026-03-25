const fs = require('fs');
let text = fs.readFileSync('prisma/schema.prisma', 'utf8');
text = text.replace(/model GlobalSettings \{[\s\S]*?\}/, `model GlobalSettings {
  id                String   @id @default("default")
  libraryName       String   @default("LibraFlow")
  contactEmail      String   @default("admin@libraflow.com")
  fineRatePerDay    Float    @default(10.0)
  maxBooksPerUser   Int      @default(3)
  loanPeriodDays    Int      @default(14)
  renewalLimit      Int      @default(2)
  updatedAt         DateTime @updatedAt
}`);
fs.writeFileSync('prisma/schema.prisma', text);
