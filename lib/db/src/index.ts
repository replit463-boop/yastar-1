import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import crypto from "node:crypto";
import { promisify } from "node:util";
import * as schema from "./schema";
import { DEFAULT_MODULE_ACCESS_BY_TIER } from "./schema/accounts";

const { Pool } = pg;
const scrypt = promisify(crypto.scrypt);

async function hashPassword(plain: string): Promise<string> {
  const salt = "1234567890abcdef1234567890abcdef";
  const key = (await scrypt(plain, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

let pool: pg.Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  } catch (err) {
    console.warn("[AI Studio] Failed to connect to database using DATABASE_URL:", err);
  }
}

// In-memory data store for fallback mode
const memoryStore = {
  accounts: [] as any[],
  scenarios: [] as any[],
  accountHistory: [] as any[],
  costItems: [] as any[],
  nextAccountId: 4,
  nextScenarioId: 5,
  nextHistoryId: 2,
};

async function initSeedData() {
  const defaultPasswordHash = await hashPassword("demo1234");
  const now = new Date();
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  memoryStore.accounts = [
    {
      id: 1,
      clerkUserId: "demo_free_owner",
      email: "demo.free@yastar.app",
      businessName: "Barbershop Rapi Jaya",
      tier: "free",
      scenarioLimit: 2,
      exportEnabled: false,
      benchmarkAccess: false,
      moduleAccess: DEFAULT_MODULE_ACCESS_BY_TIER.free,
      packageStartedAt: null,
      packageExpiresAt: null,
      passwordHash: defaultPasswordHash,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      clerkUserId: "demo_starter_owner",
      email: "demo.starter@yastar.app",
      businessName: "Salon Cantika Indah",
      tier: "starter",
      scenarioLimit: 15,
      exportEnabled: true,
      benchmarkAccess: false,
      moduleAccess: DEFAULT_MODULE_ACCESS_BY_TIER.starter,
      packageStartedAt: daysFromNow(-20),
      packageExpiresAt: daysFromNow(10),
      passwordHash: defaultPasswordHash,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 3,
      clerkUserId: "demo_professional_owner",
      email: "demo.professional@yastar.app",
      businessName: "Nirvana Spa & Wellness",
      tier: "professional",
      scenarioLimit: null,
      exportEnabled: true,
      benchmarkAccess: true,
      moduleAccess: DEFAULT_MODULE_ACCESS_BY_TIER.professional,
      packageStartedAt: daysFromNow(-90),
      packageExpiresAt: daysFromNow(275),
      passwordHash: defaultPasswordHash,
      createdAt: now,
      updatedAt: now,
    },
  ];

  memoryStore.scenarios = [
    {
      id: 1,
      accountId: 1,
      name: "Target laba Rp10 juta/bulan",
      moduleType: "target_mundur",
      businessType: "barbershop",
      employeeCount: 2,
      workingDaysPerMonth: 24,
      workingHoursPerDay: 9,
      fixedCosts: 8000000,
      targetProfit: 10000000,
      commissionModel: "flat",
      commissionConfig: { flatPercent: 40 },
      services: [
        { name: "Potong rambut", price: 35000, durationMinutes: 30 },
        { name: "Cukur jenggot", price: 20000, durationMinutes: 15 },
      ],
      resultSnapshot: {
        avgServicePrice: 27500,
        avgServiceDurationMinutes: 22.5,
        effectiveCommissionPercent: 40,
        netProfitPerClient: 16500,
        totalCostsMonthly: 18000000,
        clientsNeededTotal: 1091,
        clientsNeededPerEmployee: 545.5,
        clientsNeededPerDayPerEmployee: 22.7,
        maxCapacityPerEmployeePerMonth: 576,
        maxCapacityTotalPerMonth: 1152,
        utilizationPercent: 94.7,
        marginPercent: 35.7,
        isRealistic: false,
        insights: [
          {
            severity: "danger",
            code: "utilization_too_high",
            message:
              "Target ini membutuhkan utilisasi 94.7% dari kapasitas maksimum — hampir tidak ada ruang untuk hari libur atau klien batal.",
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      accountId: 2,
      name: "Rencana sebelum tambah karyawan",
      moduleType: "target_mundur",
      businessType: "salon",
      employeeCount: 3,
      workingDaysPerMonth: 25,
      workingHoursPerDay: 8,
      fixedCosts: 15000000,
      targetProfit: 20000000,
      commissionModel: "base_plus_commission",
      commissionConfig: { baseSalary: 2500000, baseCommissionPercent: 20 },
      services: [
        { name: "Creambath", price: 80000, durationMinutes: 60 },
        { name: "Potong & styling", price: 60000, durationMinutes: 45 },
        { name: "Smoothing", price: 350000, durationMinutes: 120 },
      ],
      resultSnapshot: {
        avgServicePrice: 163333,
        avgServiceDurationMinutes: 75,
        effectiveCommissionPercent: 20,
        netProfitPerClient: 122667,
        totalCostsMonthly: 22500000,
        clientsNeededTotal: 346,
        clientsNeededPerEmployee: 115.3,
        clientsNeededPerDayPerEmployee: 4.6,
        maxCapacityPerEmployeePerMonth: 160,
        maxCapacityTotalPerMonth: 480,
        utilizationPercent: 72.1,
        marginPercent: 47.1,
        isRealistic: true,
        insights: [
          {
            severity: "success",
            code: "healthy_margin",
            message:
              "Margin laba 47.1% berada di kisaran sehat untuk usaha salon dengan model gaji pokok + komisi.",
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 3,
      accountId: 2,
      name: "Skenario musim ramai Lebaran",
      moduleType: "target_mundur",
      businessType: "salon",
      employeeCount: 3,
      workingDaysPerMonth: 26,
      workingHoursPerDay: 10,
      fixedCosts: 15000000,
      targetProfit: 35000000,
      commissionModel: "base_plus_commission",
      commissionConfig: { baseSalary: 2500000, baseCommissionPercent: 20 },
      services: [
        { name: "Creambath", price: 80000, durationMinutes: 60 },
        { name: "Potong & styling", price: 60000, durationMinutes: 45 },
        { name: "Smoothing", price: 350000, durationMinutes: 120 },
      ],
      resultSnapshot: {
        avgServicePrice: 163333,
        avgServiceDurationMinutes: 75,
        effectiveCommissionPercent: 20,
        netProfitPerClient: 122667,
        totalCostsMonthly: 22500000,
        clientsNeededTotal: 468,
        clientsNeededPerEmployee: 156,
        clientsNeededPerDayPerEmployee: 6,
        maxCapacityPerEmployeePerMonth: 208,
        maxCapacityTotalPerMonth: 624,
        utilizationPercent: 75,
        marginPercent: 60.2,
        isRealistic: true,
        insights: [
          {
            severity: "warning",
            code: "seasonal_spike",
            message:
              "Target musiman ini realistis, tapi pastikan jam kerja tambahan tidak berlangsung terus-menerus di luar musim ramai.",
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 4,
      accountId: 3,
      name: "Target laba tahunan cabang utama",
      moduleType: "target_mundur",
      businessType: "spa",
      employeeCount: 6,
      workingDaysPerMonth: 24,
      workingHoursPerDay: 9,
      fixedCosts: 45000000,
      targetProfit: 60000000,
      commissionModel: "tiered",
      commissionConfig: {
        tiers: [
          { minClients: 0, percent: 15 },
          { minClients: 50, percent: 25 },
          { minClients: 90, percent: 35 },
        ],
      },
      services: [
        { name: "Pijat relaksasi 60 menit", price: 250000, durationMinutes: 60 },
        { name: "Lulur & mandi susu", price: 300000, durationMinutes: 90 },
        { name: "Paket spa pasangan", price: 550000, durationMinutes: 120 },
      ],
      resultSnapshot: {
        avgServicePrice: 366667,
        avgServiceDurationMinutes: 90,
        effectiveCommissionPercent: 25,
        netProfitPerClient: 275000,
        totalCostsMonthly: 105000000,
        clientsNeededTotal: 382,
        clientsNeededPerEmployee: 63.7,
        clientsNeededPerDayPerEmployee: 2.7,
        maxCapacityPerEmployeePerMonth: 144,
        maxCapacityTotalPerMonth: 864,
        utilizationPercent: 44.2,
        marginPercent: 45.9,
        isRealistic: true,
        insights: [
          {
            severity: "info",
            code: "capacity_headroom",
            message:
              "Utilisasi hanya 44.2% dari kapasitas maksimum — masih ada ruang untuk menaikkan target laba tanpa menambah karyawan.",
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

initSeedData();

function matchCondition(row: any, cond: any): boolean {
  if (!cond) return true;
  if (typeof cond === "function") return cond(row);

  // If cond is a Drizzle 'and' / 'or' / 'eq' / 'ilike' expression object
  if (cond.conditions && Array.isArray(cond.conditions)) {
    return cond.conditions.every((c: any) => matchCondition(row, c));
  }

  // Handle Drizzle BinaryOperator (eq, ilike, etc.)
  const colName = cond.left?.name || cond.column?.name || cond.field;
  const targetVal = cond.right?.value !== undefined ? cond.right.value : cond.value;

  if (colName) {
    const rowVal = row[colName];
    if (cond.operator === "ilike" || cond.name === "Ilike" || typeof targetVal === "string" && targetVal.includes("%")) {
      const pattern = String(targetVal).replace(/%/g, "").toLowerCase();
      return String(rowVal ?? "").toLowerCase().includes(pattern);
    }
    if (typeof targetVal === "string" && typeof rowVal === "string") {
      return rowVal.toLowerCase() === targetVal.toLowerCase();
    }
    return rowVal === targetVal;
  }

  return true;
}

function resolveStore(table: any): any[] {
  const name = table?._?.name || table?.dbName || "";
  if (name.includes("scenario")) return memoryStore.scenarios;
  if (name.includes("history")) return memoryStore.accountHistory;
  if (name.includes("cost")) return memoryStore.costItems;
  return memoryStore.accounts;
}

function createMockQuery(table: any, selection?: any) {
  const store = resolveStore(table);
  let filtered = [...store];

  const builder: any = {
    where(cond: any) {
      filtered = filtered.filter((row) => matchCondition(row, cond));
      return builder;
    },
    orderBy(_order: any) {
      return builder;
    },
    then(resolve: any, reject?: any) {
      try {
        if (selection && selection.count) {
          resolve([{ count: filtered.length }]);
          return;
        }
        resolve(filtered);
      } catch (e) {
        if (reject) reject(e);
      }
    },
  };

  return builder;
}

function createMockInsert(table: any) {
  const store = resolveStore(table);
  let pendingValues: any[] = [];

  const builder: any = {
    values(val: any) {
      pendingValues = Array.isArray(val) ? val : [val];
      return builder;
    },
    returning() {
      const inserted: any[] = [];
      const isAccount = store === memoryStore.accounts;
      const isScenario = store === memoryStore.scenarios;

      for (const val of pendingValues) {
        const now = new Date();
        const id = isAccount
          ? memoryStore.nextAccountId++
          : isScenario
            ? memoryStore.nextScenarioId++
            : memoryStore.nextHistoryId++;
        const item = { id, createdAt: now, updatedAt: now, ...val };
        store.push(item);
        inserted.push(item);
      }

      return Promise.resolve(inserted);
    },
    then(resolve: any) {
      return builder.returning().then(resolve);
    },
  };

  return builder;
}

function createMockUpdate(table: any) {
  const store = resolveStore(table);
  let updateData: any = {};
  let filterCond: any = null;

  const builder: any = {
    set(val: any) {
      updateData = val;
      return builder;
    },
    where(cond: any) {
      filterCond = cond;
      return builder;
    },
    returning() {
      const updatedList: any[] = [];
      for (const row of store) {
        if (matchCondition(row, filterCond)) {
          Object.assign(row, updateData, { updatedAt: new Date() });
          updatedList.push(row);
        }
      }
      return Promise.resolve(updatedList);
    },
    then(resolve: any) {
      return builder.returning().then(resolve);
    },
  };

  return builder;
}

function createMockDelete(table: any) {
  const store = resolveStore(table);
  let filterCond: any = null;

  const builder: any = {
    where(cond: any) {
      filterCond = cond;
      return builder;
    },
    returning() {
      const deletedList: any[] = [];
      for (let i = store.length - 1; i >= 0; i--) {
        if (matchCondition(store[i], filterCond)) {
          deletedList.push(store[i]);
          store.splice(i, 1);
        }
      }
      return Promise.resolve(deletedList);
    },
    then(resolve: any) {
      return builder.returning().then(resolve);
    },
  };

  return builder;
}

if (!db) {
  console.warn("[AI Studio] DATABASE_URL is not set or DB offline — using in-memory mock db fallback.");
  db = {
    select: (selection?: any) => ({
      from: (table: any) => createMockQuery(table, selection),
    }),
    insert: (table: any) => createMockInsert(table),
    update: (table: any) => createMockUpdate(table),
    delete: (table: any) => createMockDelete(table),
  };
}

export { pool, db };
export * from "./schema";
