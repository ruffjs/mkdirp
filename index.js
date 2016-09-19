var path = require('path');
var fs = require('fs');
var _0777 = parseInt('0777', 8);

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

function mkdirP (p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    var mode = opts.mode;
    var xfs = opts.fs || fs;

    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;

    var cb = f || function () {};
    p = path.resolve(p);

    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        if (/ENOENT/.test(er.message)) {
            mkdirP(path.dirname(p), opts, function (er, made) {
                if (er) cb(er, made);
                else mkdirP(p, opts, cb, made);
            });
        } else {
            xfs.stat(p, function (er2, stat) {
                // if the stat fails, then that's super weird.
                // let the original error be the failure reason.
                if (er2 || !stat.isDirectory()) cb(er, made);
                else cb(null, made);
            });
        }
    });
}

mkdirP.sync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    var mode = opts.mode;
    var xfs = opts.fs || fs;

    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;

    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        if (/ENOENT/.test(err0.message)) {
            made = sync(path.dirname(p), opts, made);
            sync(p, opts, made);
        } else {
            var stat;
            try {
                stat = xfs.statSync(p);
            }
            catch (err1) {
                throw err0;
            }
            if (!stat.isDirectory()) throw err0;
        }
    }

    return made;
};
