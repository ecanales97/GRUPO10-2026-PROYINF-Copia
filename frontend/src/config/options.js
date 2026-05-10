import { backendUrl } from "utils/backend";
import { parseMoneyString, parseMoneyStringMoney } from "utils/parsers";

// PLAZO
const optionsTerm = [
    { value: '6', label: '6 meses' },
    { value: '12', label: '12 meses' },
    { value: '24', label: '24 meses' },
    { value: '36', label: '36 meses' },
    { value: '48', label: '48 meses' },
    { value: '60', label: '60 meses' },
    { value: '0', label: 'Otro' }
];

// RENTA
const rangeIncome = [
    500_000,
    1_500_000,
    3_000_000,
    6_000_000
]
let optionsIncome = [];
for (let i = 0; i <= rangeIncome.length; i++) {
    const minIncome = i === 0 ? null : rangeIncome[i-1];
    const maxIncome = i === rangeIncome.length ? null : rangeIncome[i];
    if (minIncome === null) {
        optionsIncome.push({
            value: `${parseMoneyString(maxIncome)}`,
            label: `Hasta ${parseMoneyStringMoney(maxIncome)}`
        });
        continue;
    }
    if (maxIncome === null) {
        optionsIncome.push({
            value: `${parseMoneyString(minIncome)}`,
            label: `Mas de ${parseMoneyStringMoney(minIncome)}`
        });
        continue;
    }
    optionsIncome.push({
        value: `${parseMoneyString((maxIncome + minIncome) / 2)}`,
        label: `Desde ${parseMoneyStringMoney(minIncome)} hasta ${parseMoneyStringMoney(maxIncome)}`
    });
}
optionsIncome.push({
    value: '0',
    label: "Otro"
})

const cache = {};

const fetchCatalog = (endpoint) => {
    if (cache[endpoint]) return cache[endpoint];

    const promise = fetch(`${backendUrl}/api/catalogs/${endpoint}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Error fetching ${endpoint}`);
            }
            return res.json();
        })
        .then((json) => {
            const data = json.data.map((item) => ({
                value: item.id.toString(),
                label: item.name,
            }));

            cache[endpoint] = data;

            return data;
        })
        .catch((err) => {
            delete cache[endpoint];
            throw err;
        });

    cache[endpoint] = promise;

    return promise;
};

export const getOptionsMaritalStatus = () =>
    fetchCatalog("client-marital-status");

export const getOptionsJob = () =>
    fetchCatalog("job-types");

export const getOptionsAssets = () =>
    fetchCatalog("asset-types");

export const preloadCatalogs = () => {
    return Promise.all([
        getOptionsMaritalStatus(),
        getOptionsJob(),
        getOptionsAssets(),
    ]);
};

const getCachedCatalog = (endpoint) => {
    const data = cache[endpoint];
    if (!data || data instanceof Promise) return [];
    return data;
};

export const optionsMaritalStatus = () =>
    getCachedCatalog("client-marital-status");

export const optionsJob = () =>
    getCachedCatalog("job-types");

export const optionsAssets = () =>
    getCachedCatalog("asset-types");

export { optionsIncome, optionsTerm };