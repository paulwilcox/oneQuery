
async function test () {

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
            regress: $$.regress(
                'cases, distance', 
                'time', 
                {ci: 0.95, maxDigits: 8, attachData: true }
            ),
            std: $$.std(row => row.cases, true)
        })
        .get();

    try { checker(results.regress); }
    catch (e) { console.log('Error at "$$.regress"'); throw e; }
    
    results = 
        $$(data)
        .regress(
            'cases, distance', 
            'time', 
            {ci: 0.95, maxDigits: 8, attachData: true }
        );

    try { checker(results); }
    catch (e) { console.log('Error at "dataset.regress"'); throw e; }
 
    return true;

}

// Test values come from R output as a crosscheck
async function checker (results) {

    let getCoef = (name) => results.coefficients.find(c => c.name == name);
    let intercept = getCoef('intercept');
    let cases = getCoef('cases');
    let distance = getCoef('distance');
    let model = results.model;

    let test = (desc, val, expected, round) => {
        if ($$.round(val, round) != expected)
            throw `${desc} was ${val}, ${expected} expected.`;
    }

    test(`F`, model.F, 4.668, 1e-3);
    test(`rSquared`, model.rSquared, 0.7568, 1e-4);
    test(`rSquaredAdj`, model.rSquaredAdj, 0.5947, 1e-4);
    test(`Breuch Pagan`, model.breuchPagan, 5.4282, 1e-4);
    test(`Breuch Pagan pval`, model.breuchPaganPval, 0.06626, 1e-5);
    test(`Coefficient 'intercept' value`, intercept.value, 8.5655813, 1e-7);
    test(`Coefficient 'cases' value`, cases.value, 1.1965163, 1e-7);
    test(`Coefficient 'distance' value`, distance.value, -0.0002018, 1e-7);
    test(`Pvalue for coefficient 'cases'`, cases.pVal, 0.0711, 1e-4);
    test(`Lower confidence interval for 'cases'`, cases.ci[0], -0.19098427, 1e-8);
    test(`Upper confidence interval for 'cases'`, cases.ci[1], 2.58401687, 1e-8);

}

