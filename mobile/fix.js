const fs=require('fs'); 
let c=fs.readFileSync('screens/DashboardScreen.tsx','utf8'); 
c=c.replace('rootNavigation.navigate(a.tab)','navigation.navigate(a.tab as any)'); 
fs.writeFileSync('screens/DashboardScreen.tsx',c,'utf8'); 
console.log('Fixed!'); 
