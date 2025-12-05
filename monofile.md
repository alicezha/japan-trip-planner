claude code:
```ts
import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, Calendar, MapPin, DollarSign, Plane, Loader2 } from 'lucide-react';

// ===================================
// types/index.ts
// ===================================

interface ItineraryItem {
  id: number;
  date: string;
  city: string;
  activity: string;
  time: string;
  notes: string;
}

interface BudgetItem {
  id: number;
  category: string;
  item: string;
  estimated: number;
  actual: number;
  paid: boolean;
}

interface PackingItem {
  id: number;
  item: string;
  packed: boolean;
  category: string;
}

interface DatabaseSchema {
  itinerary: ItineraryItem[];
  budget: BudgetItem[];
  packing: PackingItem[];
}

type TableName = keyof DatabaseSchema;

// ===================================
// lib/prisma.ts
// ===================================

class MockPrismaClient {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    const stored = localStorage.getItem('japan-trip-db');
    if (stored) {
      return JSON.parse(stored) as DatabaseSchema;
    }

    return {
      itinerary: [
        {
          id: 1,
          date: '2024-03-01',
          city: 'Tokyo',
          activity: 'Arrive at Narita Airport',
          time: '14:00',
          notes: 'Check into hotel in Shibuya',
        },
        {
          id: 2,
          date: '2024-03-02',
          city: 'Tokyo',
          activity: 'Senso-ji Temple & Asakusa',
          time: '09:00',
          notes: 'Traditional breakfast nearby',
        },
      ],
      budget: [
        {
          id: 1,
          category: 'Flights',
          item: 'Round trip tickets',
          estimated: 1200,
          actual: 0,
          paid: false,
        },
        {
          id: 2,
          category: 'Accommodation',
          item: 'Hotels (7 nights)',
          estimated: 700,
          actual: 0,
          paid: false,
        },
        {
          id: 3,
          category: 'Transportation',
          item: 'JR Pass (7 days)',
          estimated: 280,
          actual: 0,
          paid: false,
        },
      ],
      packing: [
        { id: 1, item: 'Passport & Visa', packed: false, category: 'Documents' },
        { id: 2, item: 'Travel adapter', packed: false, category: 'Electronics' },
        { id: 3, item: 'Comfortable walking shoes', packed: false, category: 'Clothing' },
      ],
    };
  }

  private saveData(): void {
    localStorage.setItem('japan-trip-db', JSON.stringify(this.data));
  }

  itinerary = {
    findMany: async (): Promise<ItineraryItem[]> => this.data.itinerary,
    create: async ({ data }: { data: Omit<ItineraryItem, 'id'> }): Promise<ItineraryItem> => {
      const newItem = { ...data, id: Date.now() };
      this.data.itinerary.push(newItem);
      this.saveData();
      return newItem;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: number };
      data: Partial<ItineraryItem>;
    }): Promise<ItineraryItem> => {
      const index = this.data.itinerary.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error('Not found');
      }
      this.data.itinerary[index] = { ...this.data.itinerary[index], ...data };
      this.saveData();
      return this.data.itinerary[index];
    },
    delete: async ({ where }: { where: { id: number } }): Promise<{ id: number }> => {
      this.data.itinerary = this.data.itinerary.filter((item) => item.id !== where.id);
      this.saveData();
      return { id: where.id };
    },
  };

  budget = {
    findMany: async (): Promise<BudgetItem[]> => this.data.budget,
    create: async ({ data }: { data: Omit<BudgetItem, 'id'> }): Promise<BudgetItem> => {
      const newItem = { ...data, id: Date.now() };
      this.data.budget.push(newItem);
      this.saveData();
      return newItem;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: number };
      data: Partial<BudgetItem>;
    }): Promise<BudgetItem> => {
      const index = this.data.budget.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error('Not found');
      }
      this.data.budget[index] = { ...this.data.budget[index], ...data };
      this.saveData();
      return this.data.budget[index];
    },
    delete: async ({ where }: { where: { id: number } }): Promise<{ id: number }> => {
      this.data.budget = this.data.budget.filter((item) => item.id !== where.id);
      this.saveData();
      return { id: where.id };
    },
  };

  packing = {
    findMany: async (): Promise<PackingItem[]> => this.data.packing,
    create: async ({ data }: { data: Omit<PackingItem, 'id'> }): Promise<PackingItem> => {
      const newItem = { ...data, id: Date.now() };
      this.data.packing.push(newItem);
      this.saveData();
      return newItem;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: number };
      data: Partial<PackingItem>;
    }): Promise<PackingItem> => {
      const index = this.data.packing.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error('Not found');
      }
      this.data.packing[index] = { ...this.data.packing[index], ...data };
      this.saveData();
      return this.data.packing[index];
    },
    delete: async ({ where }: { where: { id: number } }): Promise<{ id: number }> => {
      this.data.packing = this.data.packing.filter((item) => item.id !== where.id);
      this.saveData();
      return { id: where.id };
    },
  };
}

const prisma = new MockPrismaClient();

// ===================================
// lib/api-server.ts
// ===================================

const handleApiRequest = async (
  endpoint: string,
  method: string,
  body: unknown,
): Promise<unknown> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const [, resource, id] = endpoint.split('/').filter(Boolean);

  try {
    if (resource === 'itinerary') {
      if (method === 'GET') return await prisma.itinerary.findMany();
      if (method === 'POST')
        return await prisma.itinerary.create({ data: body as Omit<ItineraryItem, 'id'> });
      if (method === 'PUT')
        return await prisma.itinerary.update({
          where: { id: Number(id) },
          data: body as Partial<ItineraryItem>,
        });
      if (method === 'DELETE')
        return await prisma.itinerary.delete({ where: { id: Number(id) } });
    }

    if (resource === 'budget') {
      if (method === 'GET') return await prisma.budget.findMany();
      if (method === 'POST')
        return await prisma.budget.create({ data: body as Omit<BudgetItem, 'id'> });
      if (method === 'PUT')
        return await prisma.budget.update({
          where: { id: Number(id) },
          data: body as Partial<BudgetItem>,
        });
      if (method === 'DELETE') return await prisma.budget.delete({ where: { id: Number(id) } });
    }

    if (resource === 'packing') {
      if (method === 'GET') return await prisma.packing.findMany();
      if (method === 'POST')
        return await prisma.packing.create({ data: body as Omit<PackingItem, 'id'> });
      if (method === 'PUT')
        return await prisma.packing.update({
          where: { id: Number(id) },
          data: body as Partial<PackingItem>,
        });
      if (method === 'DELETE') return await prisma.packing.delete({ where: { id: Number(id) } });
    }
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

const originalFetch = window.fetch;
window.fetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  const urlString = typeof url === 'string' ? url : url.toString();
  if (urlString.startsWith('/api')) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;
    const data = await handleApiRequest(urlString, method, body);
    return {
      ok: true,
      json: async () => data,
    } as Response;
  }
  return originalFetch(url, options);
};

// ===================================
// lib/api-client.ts
// ===================================

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return response.json();
  }

  itinerary = {
    getAll: () => this.request<ItineraryItem[]>('/itinerary'),
    create: (data: Omit<ItineraryItem, 'id'>) =>
      this.request<ItineraryItem>('/itinerary', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<ItineraryItem>) =>
      this.request<ItineraryItem>(`/itinerary/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<{ id: number }>(`/itinerary/${id}`, {
        method: 'DELETE',
      }),
  };

  budget = {
    getAll: () => this.request<BudgetItem[]>('/budget'),
    create: (data: Omit<BudgetItem, 'id'>) =>
      this.request<BudgetItem>('/budget', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<BudgetItem>) =>
      this.request<BudgetItem>(`/budget/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<{ id: number }>(`/budget/${id}`, {
        method: 'DELETE',
      }),
  };

  packing = {
    getAll: () => this.request<PackingItem[]>('/packing'),
    create: (data: Omit<PackingItem, 'id'>) =>
      this.request<PackingItem>('/packing', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<PackingItem>) =>
      this.request<PackingItem>(`/packing/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<{ id: number }>(`/packing/${id}`, {
        method: 'DELETE',
      }),
  };
}

const api = new ApiClient();

// ===================================
// components/ui/button.tsx
// ===================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-red-500 text-white hover:bg-red-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  };

  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ===================================
// components/ui/input.tsx
// ===================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input
    className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 ${className}`}
    {...props}
  />
);

// ===================================
// components/ui/checkbox.tsx
// ===================================

interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => (
  <input type="checkbox" checked={checked} onChange={onChange} className="w-5 h-5 cursor-pointer" />
);

// ===================================
// components/ui/table.tsx
// ===================================

const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full">{children}</table>
  </div>
);

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-gray-50">{children}</thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => <tbody>{children}</tbody>;

const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <tr className={`border-b hover:bg-gray-50 ${className}`}>{children}</tr>;

const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{children}</th>
);

const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <td className={`px-4 py-3 ${className}`}>{children}</td>;

// ===================================
// components/features/itinerary-table.tsx
// ===================================

interface ItineraryTableProps {
  items: ItineraryItem[];
  onUpdate: (id: number, field: keyof ItineraryItem, value: string) => void;
  onDelete: (id: number) => void;
}

const ItineraryTable: React.FC<ItineraryTableProps> = ({ items, onUpdate, onDelete }) => (
  <Table>
    <TableHeader>
      <tr>
        <TableHead>Date</TableHead>
        <TableHead>City</TableHead>
        <TableHead>Activity</TableHead>
        <TableHead>Time</TableHead>
        <TableHead>Notes</TableHead>
        <TableHead />
      </tr>
    </TableHeader>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell>
            <Input
              type="date"
              value={item.date}
              onChange={(e) => onUpdate(item.id, 'date', e.target.value)}
            />
          </TableCell>
          <TableCell>
            <Input
              value={item.city}
              onChange={(e) => onUpdate(item.id, 'city', e.target.value)}
              placeholder="Tokyo"
            />
          </TableCell>
          <TableCell>
            <Input
              value={item.activity}
              onChange={(e) => onUpdate(item.id, 'activity', e.target.value)}
              placeholder="Activity"
            />
          </TableCell>
          <TableCell>
            <Input
              type="time"
              value={item.time}
              onChange={(e) => onUpdate(item.id, 'time', e.target.value)}
            />
          </TableCell>
          <TableCell>
            <Input
              value={item.notes}
              onChange={(e) => onUpdate(item.id, 'notes', e.target.value)}
              placeholder="Notes"
            />
          </TableCell>
          <TableCell>
            <button type="button" onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// ===================================
// components/features/budget-summary.tsx
// ===================================

interface BudgetSummaryProps {
  estimated: number;
  actual: number;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ estimated, actual }) => {
  const difference = actual - estimated;
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Estimated Total</p>
        <p className="text-2xl font-bold text-blue-600">${estimated.toFixed(2)}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Actual Total</p>
        <p className="text-2xl font-bold text-green-600">${actual.toFixed(2)}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Difference</p>
        <p className={`text-2xl font-bold ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
          ${Math.abs(difference).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

// ===================================
// components/features/budget-table.tsx
// ===================================

interface BudgetTableProps {
  items: BudgetItem[];
  onUpdate: (id: number, field: keyof BudgetItem, value: string | number | boolean) => void;
  onDelete: (id: number) => void;
}

const BudgetTable: React.FC<BudgetTableProps> = ({ items, onUpdate, onDelete }) => (
  <Table>
    <TableHeader>
      <tr>
        <TableHead>Category</TableHead>
        <TableHead>Item</TableHead>
        <TableHead>Estimated ($)</TableHead>
        <TableHead>Actual ($)</TableHead>
        <TableHead>Paid</TableHead>
        <TableHead />
      </tr>
    </TableHeader>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell>
            <Input
              value={item.category}
              onChange={(e) => onUpdate(item.id, 'category', e.target.value)}
              placeholder="Category"
            />
          </TableCell>
          <TableCell>
            <Input
              value={item.item}
              onChange={(e) => onUpdate(item.id, 'item', e.target.value)}
              placeholder="Item description"
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              value={item.estimated}
              onChange={(e) => onUpdate(item.id, 'estimated', e.target.value)}
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              value={item.actual}
              onChange={(e) => onUpdate(item.id, 'actual', e.target.value)}
            />
          </TableCell>
          <TableCell>
            <Checkbox
              checked={item.paid}
              onChange={(e) => onUpdate(item.id, 'paid', e.target.checked)}
            />
          </TableCell>
          <TableCell>
            <button type="button" onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// ===================================
// components/features/packing-progress.tsx
// ===================================

interface PackingProgressProps {
  packed: number;
  total: number;
}

const PackingProgress: React.FC<PackingProgressProps> = ({ packed, total }) => {
  const percentage = (packed / total) * 100;
  return (
    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">Progress</p>
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-lg font-bold text-blue-600">
          {packed}/{total}
        </p>
      </div>
    </div>
  );
};

// ===================================
// components/features/packing-table.tsx
// ===================================

interface PackingTableProps {
  items: PackingItem[];
  onUpdate: (id: number, field: keyof PackingItem, value: string | boolean) => void;
  onDelete: (id: number) => void;
}

const PackingTable: React.FC<PackingTableProps> = ({ items, onUpdate, onDelete }) => (
  <Table>
    <TableHeader>
      <tr>
        <TableHead>Packed</TableHead>
        <TableHead>Item</TableHead>
        <TableHead>Category</TableHead>
        <TableHead />
      </tr>
    </TableHeader>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell>
            <Checkbox
              checked={item.packed}
              onChange={(e) => onUpdate(item.id, 'packed', e.target.checked)}
            />
          </TableCell>
          <TableCell>
            <Input
              value={item.item}
              onChange={(e) => onUpdate(item.id, 'item', e.target.value)}
              placeholder="Item name"
            />
          </TableCell>
          <TableCell>
            <Input
              value={item.category}
              onChange={(e) => onUpdate(item.id, 'category', e.target.value)}
              placeholder="Category"
            />
          </TableCell>
          <TableCell>
            <button type="button" onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// ===================================
// components/features/tab-button.tsx
// ===================================

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
      active ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-600 hover:text-red-500'
    }`}
  >
    <Icon className="w-4 h-4" />
    {children}
  </button>
);

// ===================================
// hooks/use-itinerary.ts
// ===================================

interface UseItineraryReturn {
  items: ItineraryItem[];
  loading: boolean;
  addItem: () => Promise<void>;
  updateItem: (id: number, field: keyof ItineraryItem, value: string) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

const useItinerary = (): UseItineraryReturn => {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.itinerary.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to load itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    const newItem = { date: '', city: '', activity: '', time: '', notes: '' };
    try {
      const created = await api.itinerary.create(newItem);
      setItems([...items, created]);
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const updateItem = async (id: number, field: keyof ItineraryItem, value: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      const updated = await api.itinerary.update(id, { ...item, [field]: value });
      setItems(items.map((i) => (i.id === id ? updated : i)));
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await api.itinerary.delete(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  return { items, loading, addItem, updateItem, deleteItem };
};

// ===================================
// hooks/use-budget.ts
// ===================================

interface UseBudgetReturn {
  items: BudgetItem[];
  loading: boolean;
  addItem: () => Promise<void>;
  updateItem: (id: number, field: keyof BudgetItem, value: string | number | boolean) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  totals: {
    estimated: number;
    actual: number;
  };
}

const useBudget = (): UseBudgetReturn => {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.budget.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to load budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    const newItem = { category: '', item: '', estimated: 0, actual: 0, paid: false };
    try {
      const created = await api.budget.create(newItem);
      setItems([...items, created]);
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const updateItem = async (id: number, field: keyof BudgetItem, value: string | number | boolean) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      const updated = await api.budget.update(id, { ...item, [field]: value });
      setItems(items.map((i) => (i.id === id ? updated : i)));
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await api.budget.delete(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const totals = {
    estimated: items.reduce((sum, item) => sum + Number(item.estimated || 0), 0),
    actual: items.reduce((sum, item) => sum + Number(item.actual || 0), 0),
  };

  return { items, loading, addItem, updateItem, deleteItem, totals };
};

// ===================================
// hooks/use-packing.ts
// ===================================

interface UsePackingReturn {
  items: PackingItem[];
  loading: boolean;
  addItem: () => Promise<void>;
  updateItem: (id: number, field: keyof PackingItem, value: string | boolean) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  progress: {
    packed: number;
    total: number;
  };
}

const usePacking = (): UsePackingReturn => {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.packing.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to load packing list:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    const newItem = { item: '', packed: false, category: '' };
    try {
      const created = await api.packing.create(newItem);
      setItems([...items, created]);
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const updateItem = async (id: number, field: keyof PackingItem, value: string | boolean) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      const updated = await api.packing.update(id, { ...item, [field]: value });
      setItems(items.map((i) => (i.id === id ? updated : i)));
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await api.packing.delete(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const progress = {
    packed: items.filter((i) => i.packed).length,
    total: items.length,
  };

  return { items, loading, addItem, updateItem, deleteItem, progress };
};

// ===================================
// utils/export-csv.ts
// ===================================

const exportToCSV = (data: Record<string, unknown>[], filename: string, columns: string[]): void => {
  let csv = `${columns.join(',')}\n`;
  for (const row of data) {
    csv += `${columns.map((col) => row[col] || '').join(',')}\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

// ===================================
// app/page.tsx
// ===================================

const JapanTripPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'packing'>('itinerary');

  const itinerary = useItinerary();
  const budget = useBudget();
  const packing = usePacking();

  const handleExport = () => {
    if (activeTab === 'itinerary') {
      exportToCSV(itinerary.items, 'itinerary.csv', ['date', 'city', 'activity', 'time', 'notes']);
    } else if (activeTab === 'budget') {
      exportToCSV(budget.items, 'budget.csv', ['category', 'item', 'estimated', 'actual', 'paid']);
    } else if (activeTab === 'packing') {
      exportToCSV(packing.items, 'packing.csv', ['item', 'category', 'packed']);
    }
  };

  const isLoading = itinerary.loading || budget.loading || packing.loading;

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plane className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Japan Trip Planner</h1>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">🇯🇵 Your Adventure Awaits</p>
              </div>
            </div>
          </div>

          <div className="flex border-b">
            <TabButton
              active={activeTab === 'itinerary'}
              onClick={() => setActiveTab('itinerary')}
              icon={Calendar}
            >
              Itinerary
            </TabButton>
            <TabButton
              active={activeTab === 'budget'}
              onClick={() => setActiveTab('budget')}
              icon={DollarSign}
            >
              Budget
            </TabButton>
            <TabButton
              active={activeTab === 'packing'}
              onClick={() => setActiveTab('packing')}
              icon={MapPin}
            >
              Packing List
            </TabButton>
          </div>

          <div className="p-6">
            {activeTab === 'itinerary' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Daily Itinerary</h2>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleExport}>
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                    <Button onClick={itinerary.addItem}>
                      <Plus className="w-4 h-4" />
                      Add Day
                    </Button>
                  </div>
                </div>
                <ItineraryTable
                  items={itinerary.items}
                  onUpdate={itinerary.updateItem}
                  onDelete={itinerary.deleteItem}
                />
              </div>
            )}

            {activeTab === 'budget' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Trip Budget</h2>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleExport}>
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                    <Button onClick={budget.addItem}>
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>
                </div>
                <BudgetSummary estimated={budget.totals.estimated} actual={budget.totals.actual} />
                <BudgetTable
                  items={budget.items}
                  onUpdate={budget.updateItem}
                  onDelete={budget.deleteItem}
                />
              </div>
            )}

            {activeTab === 'packing' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Packing List</h2>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleExport}>
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                    <Button onClick={packing.addItem}>
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>
                </div>
                <PackingProgress packed={packing.progress.packed} total={packing.progress.total} />
                <PackingTable
                  items={packing.items}
                  onUpdate={packing.updateItem}
                  onDelete={packing.deleteItem}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JapanTripPlanner;
```