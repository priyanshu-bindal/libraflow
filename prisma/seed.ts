import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const fiction = await prisma.category.upsert({
    where: { name: 'Fiction' },
    update: {},
    create: { name: 'Fiction' },
  })

  const science = await prisma.category.upsert({
    where: { name: 'Science' },
    update: {},
    create: { name: 'Science' },
  })

  const technology = await prisma.category.upsert({
    where: { name: 'Technology' },
    update: {},
    create: { name: 'Technology' },
  })

  const history = await prisma.category.upsert({
    where: { name: 'History' },
    update: {},
    create: { name: 'History' },
  })

  const mathematics = await prisma.category.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: { name: 'Mathematics' },
  })

  console.log('✅ Created 5 categories')

  // Create books
  const books = [
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0-06-112008-4',
      categoryId: fiction.id,
      publishedYear: 1960,
      publisher: 'J.B. Lippincott',
      description: 'A gripping tale of racial injustice in the American South.',
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      categoryId: fiction.id,
      publishedYear: 1925,
      publisher: 'Scribner',
      description: 'An American classic of love and ambition.',
      totalCopies: 2,
      availableCopies: 2,
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0-451-52493-2',
      categoryId: fiction.id,
      publishedYear: 1949,
      publisher: 'Secker & Warburg',
      description: 'A dystopian novel exploring totalitarianism.',
      totalCopies: 4,
      availableCopies: 4,
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0-553-38016-3',
      categoryId: science.id,
      publishedYear: 1988,
      publisher: 'Bantam Dell',
      description: 'An exploration of cosmology and physics.',
      totalCopies: 2,
      availableCopies: 2,
    },
    {
      title: 'The Selfish Gene',
      author: 'Richard Dawkins',
      isbn: '978-0-19-286092-7',
      categoryId: science.id,
      publishedYear: 1976,
      publisher: 'Oxford University Press',
      description: 'A revolutionary look at evolution.',
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0-13-235088-4',
      categoryId: technology.id,
      publishedYear: 2008,
      publisher: 'Prentice Hall',
      description: 'A handbook of agile software craftsmanship.',
      totalCopies: 5,
      availableCopies: 5,
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'David Thomas, Andrew Hunt',
      isbn: '978-0-13-595705-9',
      categoryId: technology.id,
      publishedYear: 1999,
      publisher: 'Addison-Wesley',
      description: 'Your journey to mastery in software development.',
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: 'A History of Ancient Rome',
      author: 'Mary Beard',
      isbn: '978-0-87923-854-5',
      categoryId: history.id,
      publishedYear: 2015,
      publisher: 'Liveright',
      description: 'A comprehensive history of ancient Rome.',
      totalCopies: 2,
      availableCopies: 2,
    },
    {
      title: 'Calculus Made Easy',
      author: 'Silvanus P. Thompson',
      isbn: '978-0-312-18548-1',
      categoryId: mathematics.id,
      publishedYear: 1998,
      publisher: 'Macmillan',
      description: 'An accessible introduction to calculus.',
      totalCopies: 4,
      availableCopies: 4,
    },
    {
      title: 'Introduction to Linear Algebra',
      author: 'Gilbert Strang',
      isbn: '978-0-98432-089-8',
      categoryId: mathematics.id,
      publishedYear: 2009,
      publisher: 'Wellesley-Cambridge Press',
      description: 'A comprehensive guide to linear algebra.',
      totalCopies: 3,
      availableCopies: 3,
    },
  ]

  for (const bookData of books) {
    await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {},
      create: bookData,
    })
  }

  console.log('✅ Created 10 books')

  // Create users
  const hashedAdminPassword = await bcrypt.hash('Admin@123', 12)
  const hashedLibrarianPassword = await bcrypt.hash('Librarian@123', 12)
  const hashedUserPassword = await bcrypt.hash('User@123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@libraflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@libraflow.com',
      passwordHash: hashedAdminPassword,
      role: 'SUPER_ADMIN',
      phone: '+91-9876543210',
      address: '123 Library Street, City, Country',
    },
  })

  await prisma.user.upsert({
    where: { email: 'librarian1@libraflow.com' },
    update: {},
    create: {
      name: 'Librarian One',
      email: 'librarian1@libraflow.com',
      passwordHash: hashedLibrarianPassword,
      role: 'LIBRARIAN',
      phone: '+91-9876543211',
      address: '124 Library Street, City, Country',
    },
  })

  await prisma.user.upsert({
    where: { email: 'librarian2@libraflow.com' },
    update: {},
    create: {
      name: 'Librarian Two',
      email: 'librarian2@libraflow.com',
      passwordHash: hashedLibrarianPassword,
      role: 'LIBRARIAN',
      phone: '+91-9876543212',
      address: '125 Library Street, City, Country',
    },
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@libraflow.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'user1@libraflow.com',
      passwordHash: hashedUserPassword,
      role: 'USER',
      phone: '+91-9876543220',
      address: '200 Student Ave, City, Country',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@libraflow.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'user2@libraflow.com',
      passwordHash: hashedUserPassword,
      role: 'USER',
      phone: '+91-9876543221',
      address: '201 Student Ave, City, Country',
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'user3@libraflow.com' },
    update: {},
    create: {
      name: 'Robert Wilson',
      email: 'user3@libraflow.com',
      passwordHash: hashedUserPassword,
      role: 'USER',
      phone: '+91-9876543222',
      address: '202 Student Ave, City, Country',
    },
  })

  const user4 = await prisma.user.upsert({
    where: { email: 'user4@libraflow.com' },
    update: {},
    create: {
      name: 'Emily Brown',
      email: 'user4@libraflow.com',
      passwordHash: hashedUserPassword,
      role: 'USER',
      phone: '+91-9876543223',
      address: '203 Student Ave, City, Country',
    },
  })

  const user5 = await prisma.user.upsert({
    where: { email: 'user5@libraflow.com' },
    update: {},
    create: {
      name: 'Michael Johnson',
      email: 'user5@libraflow.com',
      passwordHash: hashedUserPassword,
      role: 'USER',
      phone: '+91-9876543224',
      address: '204 Student Ave, City, Country',
    },
  })

  console.log('✅ Created 1 SUPER_ADMIN, 2 LIBRARIAN, and 5 USER accounts')

  console.log('\n📚 Seed data created successfully!')
  console.log('\n🔑 Test Accounts:')
  console.log('   SUPER_ADMIN: admin@libraflow.com / Admin@123')
  console.log('   LIBRARIAN: librarian1@libraflow.com / Librarian@123')
  console.log('   USER: user1@libraflow.com / User@123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
