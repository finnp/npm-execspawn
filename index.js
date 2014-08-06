var spawn = require('child_process').spawn
var parse = require('shell-quote').parse
var xtend = require('xtend')
var path = require('path')

var PATH_SEP = process.platform === 'win32' ? ';' : ':'
var PATH_KEY = process.platform === 'win32' && !(process.env.PATH && !process.env.Path) ? 'Path' : 'PATH'

var toString = function(cmd) {
  return cmd.pattern || cmd.op || cmd
}

var npmRunPath = function(cwd, PATH) {
  var prev = cwd
  var result = []
  while (true) {
    result.push(path.join(cwd, 'node_modules/.bin'))
    var parent = path.join(cwd, '..')
    if (parent === cwd) return result.concat(PATH).join(PATH_SEP)
    cwd = parent
  }
}

module.exports = function(cmd, args, opts) {
  if (!Array.isArray(args)) return module.exports(cmd, [], args || opts)
  if (!opts) opts = {}
  if (!args) args = []

  var parsed = parse(cmd, xtend(opts.env, args, {'':'$'})).map(toString)
  var env = opts.env || process.env
  var override = {}
  override[PATH_KEY] = npmRunPath(path.resolve(process.cwd(), opts.cwd || '.'), env[PATH_KEY] || process.env[PATH_KEY])

  return spawn(parsed[0], parsed.splice(1), xtend(opts, {env:xtend(env, override)}))
}
