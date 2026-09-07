import { int, mysqlTable, varchar, mysqlEnum, date, timestamp, boolean, json, time } from 'drizzle-orm/mysql-core';
import { defineRelations } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: int().primaryKey().autoincrement(),
  fullname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: mysqlEnum("role", ["client", "photographer"]).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  profile_image_url: varchar({length: 255})
});

export const jobpost = mysqlTable('jobpost', {
  id: int().primaryKey().autoincrement(),
  clientId: int().notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1000 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 255 }).notNull(),
  date: date().notNull(),
  duration_hours: int().notNull(),
  status: mysqlEnum("status", ["open", "filled", "completed", "cancelled"]).notNull(),
  totalPrice: int().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int().primaryKey().autoincrement(),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  phoneNumber: varchar({ length: 20 }),
  imageUrl: varchar({ length: 500 }),
  bio: varchar({ length: 400 }),
  website: varchar({ length: 255 }),
  location: varchar({ length: 255 }),
  profile_image_url: varchar({length:255}),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export const photographer_profiles = mysqlTable("photographer_profiles", {
  id: int().primaryKey().autoincrement(),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  phoneNumber: varchar({ length: 20 }),
  bio: varchar({ length: 400 }),
  fullname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  role: mysqlEnum("role", ["client", "photographer"]).notNull(),
  location: varchar({ length: 255 }),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
  experience: int().notNull(),
  hourlyRate: int().notNull(),
  specialties: json('specialties').$type<string[]>().default([]),
  availability: boolean().notNull(),
  portfolio_image_url: json('portfolio_image_url').$type<string[]>().default([]),
  profile_image_url: varchar({length: 255}),
  
});

export const booking = mysqlTable("booking", {
  id: int().primaryKey().autoincrement(),
  clientId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  photographerId: int().notNull().references(() => photographer_profiles.id, { onDelete: "cascade" }),
  startDate: date().notNull(),
  startTime: time().notNull(),
  durationHours: int().notNull(),
  location: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "rejected"]).notNull(),
  messages: varchar({ length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updataed: timestamp().defaultNow().onUpdateNow(),
  totalPrice: int().notNull()
});

export const portfolio = mysqlTable("portfolio", {
  id: int().primaryKey().autoincrement(),
  photographer_id: int().notNull(),
  title: varchar({ length: 255 }),
  description: varchar({ length: 255 }),
  image_url: varchar({ length: 255 })
});

export const job_applications = mysqlTable('job_applications', {
  id: int().primaryKey().autoincrement(),
  jobId: int().notNull(),
  photographerId: int().notNull(),
  message: varchar({ length: 255 }).notNull(),
  bidAmount: int(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).notNull(),
  isRead: boolean().default(false),
});


export const photographer_portfolios = mysqlTable("photographer_portfolios", {
  id: int().primaryKey().autoincrement(),
  photographerId: int().notNull().references(() => photographer_profiles.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1000 }).notNull(),
  imageUrl: json("imageUrl").$type<string[]>().default([]),
  category:json("category").$type<string[]>().default([]),
  location: varchar({ length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
  
})

// ✅ FIX: The export MUST be named exactly 'relations'
export const relations = defineRelations(
  { users, photographer_profiles, profiles },
  (r) => ({
    users: {
      photographer_profiles: r.one.photographer_profiles({
        from: r.users.id,
        to: r.photographer_profiles.userId
      }),
      profiles: r.one.profiles({
        from: r.users.id,
        to: r.profiles.userId
      }),
    },
  })
);
