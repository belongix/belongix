const fs=require('fs'); 
let c=fs.readFileSync('screens/DashboardScreen.tsx','utf8'); 
c=c.replace("if (!a.tab) return; const tabs=['Home','Jobs','Bexi','Learn','Profile']; if(tabs.includes(a.tab)){navigation.navigate(a.tab as any);}else{navigationRef.navigate(a.tab as never);}","if (!a.tab) return; const stackScreens=['Salary','Mentors','Community','Resume','Score']; if(stackScreens.includes(a.tab)){navigationRef.navigate(a.tab as never);}else{navigation.navigate(a.tab as any);}"); 
fs.writeFileSync('screens/DashboardScreen.tsx',c,'utf8'); 
console.log('Done'); 
