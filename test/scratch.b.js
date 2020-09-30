import * as g from '../src/general.js';



async function test () {

    let k = 9; // # vars
    let x = 5.38; // chi-square val

    let regGamma = (a,b) => g.incGammaLower(a, b) / g.gamma(a);
    let result = regGamma(k/2, x/2);

    console.log({
        igl: g.incGammaLower(k/2, x/2),
        g: g.gamma(k/2),
        cdfResult: result,
        pResult: 1 - result
    });


/*

    let F = g.getInverse(
        (input) => g.Fcdf(input, 5, 10),
        0.05,
        1e-12, // precision to desired output
        1000,
        0,
        5,
        0,
        null
    )

    console.log({F})

    return;


    //let data = await sample('orders');

    let data = [
        { cases: 7, distance: 560, time: 16.68 },
        { cases: 3, distance: 220, time: 11.50 },
        { cases: 3, distance: 340, time: 12.03 },
        { cases: 4, distance: 80, time: 14.88 },
        { cases: 6, distance: 150, time: 13.75 },
        { cases: 7, distance: 330, time: 18.11 }
    ];

    let results = 
        $$(data)
        .reduce({
            model: $$.regress('cases, distance', 'time', {ci: 0.95}),
            std: $$.std(row => row.cases, true)
        })
        .get();

    console.log(results.model)

    return true;

*/
}

