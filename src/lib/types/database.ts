export type UserRole = "Student" | "Volunteer" | "Admin";
export type RegistrationStatus = "Pending" | "Checked-In" | "Cancelled";
export type EventStatus = "Draft" | "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
export type AccessType = "Free" | "Paid";
export type ExpenseCategory = "Hospitality" | "Marketing" | "Operations" | "Logistics" | "Other";
export type ScanResult = "Success" | "Duplicate" | "Invalid";

export interface User {
  id: string;
  auth_id: string;
  name: string;
  reg_no: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  date: string;
  end_date: string | null;
  venue: string;
  cover_image: string | null;
  organizer: string | null;
  access_type: AccessType;
  price: number;
  total_budget: number;
  max_attendees: number | null;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  qr_hash: string;
  status: RegistrationStatus;
  full_name: string;
  student_id: string | null;
  phone: string | null;
  primary_interest: string | null;
  feedback_submitted: boolean;
  feedback_rating: number | null;
  feedback_liked: string | null;
  feedback_improved: string | null;
  certificate_generated: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  event?: Event;
  user?: User;
}

export interface Expense {
  id: string;
  event_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  logged_by: string;
  created_at: string;
}

export interface ScanLog {
  id: string;
  registration_id: string | null;
  scanned_by: string;
  event_id: string;
  scan_result: ScanResult;
  scan_location: string | null;
  scanned_name: string | null;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<Partial<User> & Pick<User, "name" | "email">, "id" | "created_at" | "updated_at">;
        Update: Partial<User>;
      };
      events: {
        Row: Event;
        Insert: Omit<Partial<Event> & Pick<Event, "title" | "venue" | "date">, "id" | "created_at" | "updated_at">;
        Update: Partial<Event>;
      };
      registrations: {
        Row: Registration;
        Insert: Omit<Partial<Registration> & Pick<Registration, "user_id" | "event_id" | "qr_hash" | "full_name">, "id" | "created_at">;
        Update: Partial<Registration>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Partial<Expense> & Pick<Expense, "event_id" | "amount" | "category" | "logged_by">, "id" | "created_at">;
        Update: Partial<Expense>;
      };
      scan_logs: {
        Row: ScanLog;
        Insert: Omit<Partial<ScanLog> & Pick<ScanLog, "scanned_by" | "event_id" | "scan_result">, "id" | "created_at">;
        Update: Partial<ScanLog>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
