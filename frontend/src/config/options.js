import { parseMoneyString, parseMoneyStringMoney } from "utils/parsers";

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

export { optionsIncome };