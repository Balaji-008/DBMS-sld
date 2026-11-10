export function formatLpa(annualRupees:number){return `${(annualRupees/100000).toLocaleString('en-IN',{maximumFractionDigits:2})} LPA`}
export function formatOpportunityCompensation(amount:number,type:'placement'|'internship'|'hackathon'){if(!amount)return null;return type==='placement'?formatLpa(amount):`₹${amount.toLocaleString('en-IN')}/month`}
