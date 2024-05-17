/*
    Currently designed to test Training.
*/

import { DataList, Train } from "./src";

(async () => {
    const list = new DataList();
    await Train(list, "This is sentence one. This is sentence two. This is sentence three. Wow! Many sentences! Is this a question?\nThis is a new line, which would also be a new sentence!")
    
    for (let i = 0; i < 100; i++) {
        const startKey = await list.GetStartKey();
        console.log(`${startKey} ${await list.Get(startKey)} `);
    }
})();