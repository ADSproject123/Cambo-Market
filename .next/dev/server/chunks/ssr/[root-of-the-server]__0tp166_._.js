module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/favicon.ico (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/favicon.2vob68tjqpejf.ico" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/src/app/favicon.ico (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 256,
    height: 256
};
}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$products$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/products.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pricing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$format$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/format.ts [app-rsc] (ecmascript)");
;
;
;
;
;
async function HomePage() {
    const categories = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$products$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listCategories"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "mb-6 text-2xl font-bold",
                children: "Shop by category"
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this),
            categories.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-neutral-500",
                children: "No listings available right now — please check back shortly."
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 13,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 sm:grid-cols-2 md:grid-cols-3",
                children: categories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: `/categories/${c.category}`,
                        className: "rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-brand",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg font-semibold",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$format$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatCategoryName"])(c.category)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 22,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm text-neutral-500",
                                children: [
                                    c.count,
                                    " listing",
                                    c.count === 1 ? '' : 's'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 23,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 font-bold text-brand",
                                children: [
                                    "from ",
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatMoney"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sellPrice"])(c.cheapestPrice), c.currency)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 24,
                                columnNumber: 15
                            }, this)
                        ]
                    }, c.category, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 17,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 15,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/page.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/lib/db/products.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteProduct",
    ()=>deleteProduct,
    "getProduct",
    ()=>getProduct,
    "getProductVariants",
    ()=>getProductVariants,
    "listCategories",
    ()=>listCategories,
    "listProducts",
    ()=>listProducts,
    "upsertManualProduct",
    ()=>upsertManualProduct,
    "upsertScrapedProducts",
    ()=>upsertScrapedProducts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/admin.ts [app-rsc] (ecmascript)");
;
async function listProducts(category) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
    let query = db.from('products').select().order('category').order('base_price', {
        ascending: true
    });
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}
async function listCategories() {
    const products = await listProducts();
    const byCategory = new Map();
    for (const p of products){
        const list = byCategory.get(p.category) ?? [];
        list.push(p);
        byCategory.set(p.category, list);
    }
    return Array.from(byCategory.entries()).map(([category, items])=>{
        const cheapest = items.reduce((a, b)=>b.base_price < a.base_price ? b : a);
        return {
            category,
            count: items.length,
            cheapestPrice: cheapest.base_price,
            currency: cheapest.currency,
            imageUrl: items.find((p)=>p.image_url)?.image_url ?? null
        };
    });
}
async function getProduct(offerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
    const { data, error } = await db.from('products').select().eq('offer_id', offerId).maybeSingle();
    if (error) throw error;
    return data;
}
async function getProductVariants(offerId) {
    const product = await getProduct(offerId);
    if (!product) return [];
    if (!product.variant_group) return [
        product
    ];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
    const { data, error } = await db.from('products').select().eq('variant_group', product.variant_group).order('base_price', {
        ascending: true
    });
    if (error) throw error;
    return data ?? [
        product
    ];
}
async function upsertScrapedProducts(category, offers) {
    if (offers.length === 0) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
    const rows = offers.map((o)=>({
            offer_id: o.offerId,
            category,
            title: o.title,
            base_price: o.price,
            currency: o.currency,
            seller_username: o.sellerUsername,
            seller_verified: o.sellerVerified,
            rating: o.rating,
            satisfaction_rate: o.satisfactionRate,
            total_success_orders: o.totalSuccessOrders,
            available_qty: o.availableQty,
            url: o.url,
            image_url: o.imageUrl ?? null,
            last_synced_at: new Date().toISOString()
        }));
    const { error } = await db.from('products').upsert(rows, {
        onConflict: 'offer_id'
    });
    if (error) throw error;
}
async function upsertManualProduct(input) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
    const offerId = input.offerId ?? `manual-${crypto.randomUUID()}`;
    const row = {
        offer_id: offerId,
        category: input.category,
        title: input.title,
        base_price: input.basePrice,
        currency: input.currency,
        url: input.url,
        image_url: input.imageUrl ?? null,
        last_synced_at: new Date().toISOString()
    };
    // Only reference these columns when actually used, so this keeps working
    // on a database that hasn't run schema_variants.sql yet.
    if (input.variantGroup) row.variant_group = input.variantGroup;
    if (input.variantLabel) row.variant_label = input.variantLabel;
    const { data, error } = await db.from('products').upsert(row, {
        onConflict: 'offer_id'
    }).select().single();
    if (error) throw error;
    return data;
}
async function deleteProduct(offerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminClient"])();
    const { error } = await db.from('products').delete().eq('offer_id', offerId);
    if (error) throw error;
}
}),
"[project]/src/lib/format.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatCategoryName",
    ()=>formatCategoryName
]);
// G2G's own category slugs sometimes abbreviate the brand oddly (e.g. Canva
// -> "cnva"), which a plain title-case would render as a typo. Override the
// display word only for known cases; everything else falls through to the
// generic formatter below.
const WORD_OVERRIDES = {
    cnva: 'Canva',
    ppq: 'PPQ',
    ai: 'AI'
};
function formatCategoryName(slug) {
    return slug.split('-').map((word)=>WORD_OVERRIDES[word] ?? word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
}),
"[project]/src/lib/pricing.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CATALOG_MARKUP_USD",
    ()=>CATALOG_MARKUP_USD,
    "applyServiceFee",
    ()=>applyServiceFee,
    "formatMoney",
    ()=>formatMoney,
    "sellPrice",
    ()=>sellPrice
]);
function applyServiceFee(price, feePercent) {
    return Math.round(price * (1 + feePercent / 100) * 100) / 100;
}
const CATALOG_MARKUP_USD = Number(process.env.CATALOG_MARKUP_USD ?? '1');
function sellPrice(basePrice) {
    return Math.round((basePrice + CATALOG_MARKUP_USD) * 100) / 100;
}
function formatMoney(amount, currency) {
    return `${amount.toFixed(2)} ${currency}`;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0tp166_._.js.map