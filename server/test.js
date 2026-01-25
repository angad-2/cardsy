import { add } from './engineWrapper.js';

console.log('Testing simple C++ engine:\n');

const result1 = add(5, 3);
console.log(`add(5, 3) = ${result1}`);

const result2 = add(10.5, 2.3);
console.log(`add(10.5, 2.3) = ${result2}`);

const result3 = add(0, 0);
console.log(`add(0, 0) = ${result3}`);

const result4 = add(-5, 10);
console.log(`add(-5, 10) = ${result4}`);

console.log('\n✅ Engine working!');
