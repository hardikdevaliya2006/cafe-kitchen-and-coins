import paneer from '@/assets/cafe/paneer-tikka.jpg';
import biryani from '@/assets/cafe/biryani.jpg';
import chicken from '@/assets/cafe/butter-chicken.jpg';
import pizza from '@/assets/cafe/pizza.jpg';
import coffee from '@/assets/cafe/coffee.jpg';
import dessert from '@/assets/cafe/dessert.jpg';
export type Food = { id: number; name: string; description: string; price: number; category: string; veg: boolean; image: string; rating: string; badge?: string };
export const foods: [Food, Food, Food, Food, Food, Food] = [
 {id:1,name:'Paneer Tikka',description:'Smoky tandoor-grilled paneer, peppers & our signature mint chutney.',price:249,category:'Starters',veg:true,image:paneer,rating:'4.8',badge:'Bestseller'},
 {id:2,name:'Chicken Dum Biryani',description:'Fragrant basmati rice, tender chicken & slow-cooked aromatic spices.',price:329,category:'Biryani',veg:false,image:biryani,rating:'4.9',badge:'Chef’s special'},
 {id:3,name:'Butter Chicken',description:'Tender chicken in a rich, creamy tomato gravy. A timeless favourite.',price:349,category:'Main Course',veg:false,image:chicken,rating:'4.8',badge:'Bestseller'},
 {id:4,name:'Margherita Pizza',description:'Stone-baked crust, fresh mozzarella, tomato & sweet basil.',price:299,category:'Pizza',veg:true,image:pizza,rating:'4.7'},
 {id:5,name:'Classic Cold Coffee',description:'Freshly brewed coffee, chilled milk & a little indulgence.',price:149,category:'Beverages',veg:true,image:coffee,rating:'4.8'},
 {id:6,name:'Gulab Jamun',description:'Soft, golden milk dumplings in fragrant rose syrup. Served warm.',price:119,category:'Desserts',veg:true,image:dessert,rating:'4.9'},
];
export const money = (n:number) => `₹${n.toLocaleString('en-IN',{maximumFractionDigits:2})}`;
export type Ticket = {id:number;table:number;time:string;status:string;items:{food:Food;qty:number}[];note?:string};
export const tickets: Ticket[] = [
 {id:1042,table:7,time:'2 min ago',status:'New Orders',items:[{food:foods[0],qty:2},{food:foods[1],qty:1}],note:'Less spicy biryani. No onions, please.'},
 {id:1041,table:3,time:'4 min ago',status:'New Orders',items:[{food:foods[2],qty:1},{food:foods[3],qty:1}]},
 {id:1040,table:12,time:'6 min ago',status:'New Orders',items:[{food:foods[4],qty:3},{food:foods[5],qty:2}],note:'Serve desserts after the main course.'},
 {id:1039,table:5,time:'8 min ago',status:'Preparing',items:[{food:foods[1],qty:2},{food:foods[0],qty:1}]},
 {id:1038,table:2,time:'12 min ago',status:'Preparing',items:[{food:foods[2],qty:2}]},
 {id:1037,table:9,time:'15 min ago',status:'Ready',items:[{food:foods[3],qty:1},{food:foods[4],qty:2}]},
 {id:1036,table:4,time:'22 min ago',status:'Completed',items:[{food:foods[0],qty:1}]},
];
export const pageHead = (title:string,description:string) => ({meta:[{title:`${title} | Cafe`},{name:'description',content:description},{property:'og:title',content:`${title} | Cafe`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]});
export const pad2 = (n:number) => n.toString().padStart(2,'0');
