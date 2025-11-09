const fs = require('fs');
const p = 'ZarfTokenWebApp/src/pages/AllEvents.jsx';
let s = fs.readFileSync(p, 'utf8');
// introduce favourites state after user declaration
s = s.replace(
  'const { user } = useAuthUser();',
  'const { user } = useAuthUser();\n\n  // Favourites state for heart toggle\n  const [favKeys, setFavKeys] = useState(new Set());\n  const [toastMsg, setToastMsg] = useState(null);\n  const [toastType, setToastType] = useState("info");'
);
// fetch favourites on mount/user change
if (!s.includes('getFavourites')) {
  s = s.replace(
    '// ===== EFFECTS =====',
    `// ===== EFFECTS =====\n\n  // Fetch favourites for heart status\n  useEffect(() => {\n    (async () => {\n      if (!user?._id) { setFavKeys(new Set()); return; }\n      try {\n        const res = await api.get(\`/user/getFavourites/\${user._id}\`);\n        const setKeys = new Set((res?.data?.favourites||[]).map(f => \`${'${'}f.itemType${'}'}:${'${'}f.itemId${'}'}\`));\n        setFavKeys(setKeys);\n      } catch (e) {\n        // non-fatal\n      }\n    })();\n  }, [user?._id]);`
  );
}
// add toggle handler functions near other handlers
if (!s.includes('handleToggleFavourite')) {
  s = s.replace(
    'const handleDeleteEvent = async (event) => {',
    `const handleToggleFavourite = async (raw) => {\n    try {\n      const key = \`${'${'}raw.type${'}'}:${'${'}raw._id${'}'}\`;\n      const isFav = favKeys.has(key);\n      if (isFav) {\n        await api.post(\`/user/removeFavourite/\${user._id}\`, { itemType: raw.type, itemId: raw._id });\n        const next = new Set(favKeys); next.delete(key); setFavKeys(next);\n        setToastMsg('Removed from favorites'); setToastType('success'); setTimeout(()=>setToastMsg(null),1500);\n      } else {\n        await api.post(\`/user/addFavourite/\${user._id}\`, { itemType: raw.type, itemId: raw._id });\n        const next = new Set(favKeys); next.add(key); setFavKeys(next);\n        setToastMsg('Added to favorites'); setToastType('success'); setTimeout(()=>setToastMsg(null),1500);\n      }\n    } catch (e) {\n      setToastMsg(e?.response?.data?.message || 'Action failed'); setToastType('error'); setTimeout(()=>setToastMsg(null),2000);\n    }\n  };\n\n  const handleDeleteEvent = async (event) => {`
  );
}
// pass props to EventCard render
s = s.replace(
  'onViewDetails={handleViewDetails}',
  'onViewDetails={handleViewDetails}\n                isFavourite={favKeys.has(`${event.type}-${event._id}`) || favKeys.has(`${event.type}:${event._id}`)}\n                onToggleFavourite={handleToggleFavourite}'
);
// render toast near end of main
s = s.replace(
  '</main>',
  `{toastMsg && (<div className={\`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white \${toastType==='error'?'bg-red-600':'bg-emerald-600'}\`}>{toastMsg}</div>)}\n      </main>`
);
fs.writeFileSync(p, s);
console.log('updated AllEvents with favourites toggle and toast');
