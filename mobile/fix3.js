const fs=require('fs'); 
let b=fs.readFileSync('navigation/BottomTabs.tsx','utf8'); 
let d=fs.readFileSync('screens/DashboardScreen.tsx','utf8'); 
fs.writeFileSync('navigation/BottomTabs.tsx',b.replace('export default function BottomTabs({ navigation }: any)','export default function BottomTabs()'),'utf8'); 
console.log('Done'); 
