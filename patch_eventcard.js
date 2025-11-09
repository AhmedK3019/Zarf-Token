const fs = require('fs');
const path = 'ZarfTokenWebApp/src/components/EventCard.jsx';
let s = fs.readFileSync(path, 'utf8');
// 1) ensure Heart import
if (!s.includes(" Heart,")) {
  s = s.replace(
    /from \"lucide-react\";\r?\n/,
    (m) => m.replace('";', ',\n  Heart,\n";')
  );
}
// 2) add props isFavourite, onToggleFavourite in destructuring
s = s.replace(
  /const EventCard = \(\{([\s\S]*?)\}\) => \{/,
  (match, inner) => {
    let updated = inner;
    if (!updated.includes('isFavourite')) updated = updated.trim().replace(/\n?\}\s*$/, ',\n  isFavourite,\n  onToggleFavourite,\n}');
    return `const EventCard = ({\n${updated}\n) => {`;
  }
);
// 3) insert heart button near top of main container
const marker = '<div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col">';
if (s.includes(marker) && !s.includes('data-testid="fav-toggle"')) {
  const injection = `${marker}\n      {/* Favourite toggle */}\n      {(typeof onToggleFavourite === 'function') && (\n        <button\n          type=\"button\"\n          aria-label=\"Toggle favourite\"\n          data-testid=\"fav-toggle\"\n          onClick={(e) => { e.stopPropagation(); onToggleFavourite?.(rawEvent); }}\n          className=\"absolute right-4 top-4 p-2 rounded-full bg-white/90 border hover:bg-white shadow-sm\"\n          title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}\n        >\n          <Heart size={18} color={isFavourite ? '#e11d48' : '#64748b'} fill={isFavourite ? '#e11d48' : 'none'} />\n        </button>\n      )}`;
  s = s.replace(marker, injection);
}
fs.writeFileSync(path, s);
console.log('patched EventCard');
