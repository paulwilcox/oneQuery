
async function test () {

    // initializations
        
        let mx = new $$.matrix([
            [3, 8, 7, 9],
            [4, 6, 2, 1],
            [9, 3, 5, 5],
            [1, 2, 4, 2]
        ]);

        let result;

    // determinant

        if (mx.determinant() != 909)
            throw `Matrix determinant is ${mx.determinant()}, 909 expected.`;

    // round

        if ($$.round(mx.norm(),5) != 20.61553)
            throw `Matrix frobenian/euclidian norm is ${mx.norm()}, 20.61553 expected.`;

    // norms

        if (mx.norm(1) != 19)
            throw `Matrix 1-norm is ${mx.norm(1)}, 19 expected.`;

        if (mx.norm('infinity') != 27)
            throw `Matrix infinity-norm is ${mx.norm('infinity')}, 27 expected.`;

    // structure checks

        mx = new $$.matrix([[1, 0, 0], [4, 5, 0], [7, 8, 9]]);
        if (!mx.isLowerTriangular())
            throw `Lower trianguar matrix not identified as such`;

        mx = new $$.matrix([[1, 2, 3], [0, 5, 6], [0, 0, 9]]);
        if (!mx.isUpperTriangular())
            throw `Upper trianguar matrix not identified as such`;

    // qr decomposition

        for (let r = 2; r < 10; r++)
        for (let c = 2; c < 10; c++) {

            let mxType = r == 9 && c == 9 ? 'hard-coded' : 'random';
            mx = mxType == 'hard-coded'
                ? new $$.matrix([[1, -1,  4], [1,  4, -2], [1,  4,  2], [1, -1,  0]])
                : new $$.matrix.randomizer().setSize(r,c).setValues(-10,10).get();

            let d = mx.decomposeQR();    
            if (!d.test(4)) {
                console.log(
                    'Failed QR decomposition results follow',
                    {
                        A: d.A.data,
                        Q: d.Q.data,
                        R: d.R.data,
                        QR: d.Q.multiply(d.R).data,
                        test: d.test(4)
                    }
                );
                throw `${mxType} ${r}x${c} matrix QR decomposition resulted in Q*R <> A.`;
            }

        }

    // svd decomposition

        for (let r = 1; r < 10; r += 3)
        for (let c = 1; c < 10; c += 3) {

            let mxType = 
                  r == 1 && c == 1 ? 'hard-coded: 1' 
                : r == 1 && c == 2 ? 'hard-coded: 2'
                : r == 2 && c == 1 ? 'random: 1'
                : r < 2 || c < 2 ? null 
                : 'random';
            
            if (mxType == null)
                continue;

            mx = 
                mxType == 'hard-coded: 1'
                    ? new $$.matrix([
                        [  8.0, 7.3, -5,   2],
                        [  4.0, 8.4,  4, -36],
                        [-43.5, 2.9, -3, -22],
                        [ 84.2, 8.8, -7,  15],
                        [-12.3, 6.5,  6,  14],
                        [ 23.3, 4.5,  6,  -8],
                        [ 32.8, 7.4, -1,  10]
                    ])
                : mxType == 'hard-coded: 2'
                    ? new $$.matrix([
                        [ 9.42343159, -3.19147822, -0.76492822],
                        [-3.89411346, -3.37494987, -9.72613311]                     
                    ])
                : mxType == 'random: 1' 
                    ? new $$.matrix.randomizer().setSize(50,50).setValues(-10,10).get()
                : new $$.matrix.randomizer().setSize(r,c).setValues(-10,10).get();

            let d;
            try {
                d = mx.decomposeSVDcomp();
                d.rebuilt = d.L.multiply(d.D).multiply(d.R.transpose());
                if (!d.rebuilt.equals(mx, 1e-8)) 
                    throw `${mxType} ${r}x${c} matrix SVD decomposition resulted in L*D*R.transpose() <> A.`;
            }
            catch(e) {
                if (e.showObjects) e.showObjects(8);
                if (e.message) e.message = e.message.replace('follows', 'precedes');
                throw e;              
            }    

        }
    
    // pseudoInverse
        
        mx = new $$.matrix([
            [  8.0, 7.3, -5,   2],
            [  4.0, 8.4,  4, -36],
            [-43.5, 2.9, -3, -22],
            [ 84.2, 8.8, -7,  15],
            [-12.3, 6.5,  6,  14],
            [ 23.3, 4.5,  6,  -8],
            [ 32.8, 7.4, -1,  10]
        ]);

        result = mx.pseudoInverse()
            .multiply(mx).round(8)
            .equals($$.matrix.identity(4));

        if (!result) 
            throw 'pseudoInverse multiplied by original did not produce identity matrix.';

    // terminations

        return true;

}
