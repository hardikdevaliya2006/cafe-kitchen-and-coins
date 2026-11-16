import { createFileRoute } from '@tanstack/react-router';
import { BillingDashboard } from '@/components/billing-dashboard';
import { pageHead } from '@/lib/cafe-data';
export const Route = createFileRoute('/billing')({head:()=>pageHead('Billing & tables','Manage Cafe tables, preview invoices and explore mock payment summaries.'),component:BillingDashboard});
