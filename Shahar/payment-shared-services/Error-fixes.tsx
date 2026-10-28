//In InstructionDetailPage.tsx, dynamic visibility in AG-Grid column definitions is controlled by the hide property. When toggling column visibility based on whether the API succeeded or failed, tracking this state with a boolean flag (e.g., isDetailsAllStageLoaded or hasStageDetailsError) allows the columnDefs to react dynamically.

// Step 1: Add a State Flag for API Success
// Around line 1530–1560 in InstructionDetailPage.tsx (where the other page-level state hooks are declared):

const [isDetailsAllStageLoaded, setIsDetailsAllStageLoaded] = useState<boolean>(false);

//Step 2: Update the Flag in fetchDetailsForAction
// In image_119.png and image_120.png (lines 2272–2299), update the
//  state inside both the success and error branches:


2272:   }).then(async (res) => {
  2273:     if (!res.ok) {
  2274:       console.warn(`details-all-stage failed with status: ${res.status}`);
  2275:       setIsDetailsAllStageLoaded(false); // Hide on HTTP failure (e.g. 500, 404)
  2276:       return null;
  2277:     }
  2278:     setIsDetailsAllStageLoaded(true); // Show on successful HTTP 200
  2279:     return normalizeDetailsAllStage(await res.json());
  2280:   });


  //And in the catch block on lines 2296–2299:

  2296:   } catch (error) {
    2297:     console.error('Failed to fetch details-all-stage:', error);
    2298:     setIsDetailsAllStageLoaded(false); // Hide on network or promise failure
    2299:     return [];
    2300:   }


  //Step 3: Wire the Flag into AG-Grid columnDefs
// Find your AG-Grid column definitions for this table (often wrapped in a useMemo named columnDefs or declared directly above the grid).

// Add hide: !isDetailsAllStageLoaded to both the Status and Actions column objects:

const columnDefs = useMemo<ColDef[]>(() => [
  { field: 'txnQty', headerName: 'Txn Qty', ... },
  { field: 'txnType', headerName: 'Txn Type', ... },
  { field: 'amount', headerName: 'Amount', ... },
  
  // Status Column
  {
    field: 'status',
    headerName: 'Status',
    hide: !isDetailsAllStageLoaded, // Hidden if details-all-stage fails
    cellRenderer: (params: any) => {
      // existing status tag renderer ("Payment Not Created", etc.)
    },
    ...
  },

  // Actions Column
  {
    headerName: 'Actions',
    colId: 'actions',
    hide: !isDetailsAllStageLoaded, // Hidden if details-all-stage fails
    cellRenderer: (params: any) => {
      // existing Action button renderer ("Edit", etc.)
    },
    ...
  },
], [isDetailsAllStageLoaded]); // Ensure isDetailsAllStageLoaded is in the dependency array

//Step 4 (If using AG-Grid v28+ or Grid API directly)
//If your AG-Grid version does not auto-refresh columns on columnDefs memo 
// change, you can update them imperatively in an effect:

useEffect(() => {
  if (gridRef.current?.api) {
    gridRef.current.api.setColumnsVisible(['status', 'actions'], isDetailsAllStageLoaded);
  }
}, [isDetailsAllStageLoaded]);


//If you want to preserve the exact original spacing / whitespace intact:
// Use a regex replace with \b[a-z] or word boundaries so spaces, tabs, or multiple gaps are completely untouched:

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};




// fix npm issue

# 1. Remove the cached native binary packages
rm -rf node_modules/@rollup node_modules/rollup

# 2. Re-install the native rollup package directly
npm install @rollup/rollup-win32-x64-msvc --save-optional

# 3. Start the dev server
npm run dev



// latest

# 1. Force remove the MSVC build folder directly
rm -rf "node_modules/@rollup/rollup-win32-x64-msvc"

# 2. Clear Vite dependency cache
rm -rf "node_modules/.vite"

# 3. Start dev server
npm run dev

// more optional changes


# Check Rollup version
npx rollup --version

# Re-install the matching MSVC binary cleanly
npm install @rollup/rollup-win32-x64-msvc@latest --force

npm run dev




"scripts": {
  "dev": "cross-env ROLLUP_SKIP_NODE_NATIVE=true vite"
}


// previous and next button modal fix


//The Fix in SplitPaymentMakerModal.tsx
//1. Derive canGoPrev and canGoNext from both the index and the props
// Find where hasPrev or the disabled state is evaluated (or right before the footer JSX):
// Derive true navigation state using currentIndex / wireIndex fallback


const resolvedCurrentIndex = currentIndex ?? wireIndex ?? 0;
const resolvedTotal = totalCount ?? 0;

const canGoPrev = hasPrev || resolvedCurrentIndex > 0;
const canGoNext = hasNext || (resolvedTotal > 0 && resolvedCurrentIndex < resolvedTotal - 1);

//2. Update the Previous Button in the Modal Footer JSX
//Locate the <button> for Previous Payment in the JSX (around lines 750–820):

// Change:
<button
  type="button"
  className="..."
  disabled={!hasPrev} // ❌ Causes the button to stay disabled if parent doesn't update hasPrev
  onClick={() => requestNavigation('prev')}
>
  « Previous Payment
</button>

// To:
<button
  type="button"
  className={canGoPrev ? "lmn-btn lmn-btn-secondary" : "lmn-btn lmn-btn-disabled"}
  disabled={!canGoPrev} // ✅ Automatically enables whenever index > 0
  onClick={() => requestNavigation('prev')}
>
  « Previous Payment
</button>


//And do the same for the Next button:

<button
  type="button"
  className={canGoNext ? "lmn-btn lmn-btn-primary" : "lmn-btn lmn-btn-disabled"}
  disabled={!canGoNext}
  onClick={() => requestNavigation('next')}
>
  Next Payment »
</button>
