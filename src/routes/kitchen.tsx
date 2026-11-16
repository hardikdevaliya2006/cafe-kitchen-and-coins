import { createFileRoute } from '@tanstack/react-router';
import { KitchenDashboard } from '@/components/kitchen-dashboard';
import { pageHead } from '@/lib/cafe-data';
export const Route = createFileRoute('/kitchen')({head:()=>pageHead('Kitchen dashboard','Cafe kitchen workspace. View and prepare dine-in orders by table.'),component:KitchenDashboard});
