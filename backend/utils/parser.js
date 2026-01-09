export function parseTransactions(text) {
const lines = text.split("\n");
const data = [];


for (const line of lines) {
const match = line.match(/(\d{2}\/\d{2}).*?R\$ ?([\d,.]+)/);
if (match) {
data.push({
data: match[1],
valor: parseFloat(match[2].replace(",", ".")),
descricao: line.trim(),
});
}
}
return data;
}