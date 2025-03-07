class V {
  /**
  Get the line description around the given position.
  */
  lineAt(t) {
    if (t < 0 || t > this.length)
      throw new RangeError(`Invalid position ${t} in document of length ${this.length}`);
    return this.lineInner(t, !1, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(t) {
    if (t < 1 || t > this.lines)
      throw new RangeError(`Invalid line number ${t} in ${this.lines}-line document`);
    return this.lineInner(t, !0, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(t, e, i) {
    [t, e] = _e(this, t, e);
    let s = [];
    return this.decompose(
      0,
      t,
      s,
      2
      /* Open.To */
    ), i.length && i.decompose(
      0,
      i.length,
      s,
      3
      /* Open.To */
    ), this.decompose(
      e,
      this.length,
      s,
      1
      /* Open.From */
    ), Ut.from(s, this.length - (e - t) + i.length);
  }
  /**
  Append another document to this one.
  */
  append(t) {
    return this.replace(this.length, this.length, t);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(t, e = this.length) {
    [t, e] = _e(this, t, e);
    let i = [];
    return this.decompose(t, e, i, 0), Ut.from(i, e - t);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(t) {
    if (t == this)
      return !0;
    if (t.length != this.length || t.lines != this.lines)
      return !1;
    let e = this.scanIdentical(t, 1), i = this.length - this.scanIdentical(t, -1), s = new yi(this), r = new yi(t);
    for (let o = e, l = e; ; ) {
      if (s.next(o), r.next(o), o = 0, s.lineBreak != r.lineBreak || s.done != r.done || s.value != r.value)
        return !1;
      if (l += s.value.length, s.done || l >= i)
        return !0;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(t = 1) {
    return new yi(this, t);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(t, e = this.length) {
    return new Kl(this, t, e);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(t, e) {
    let i;
    if (t == null)
      i = this.iter();
    else {
      e == null && (e = this.lines + 1);
      let s = this.line(t).from;
      i = this.iterRange(s, Math.max(s, e == this.lines + 1 ? this.length : e <= 1 ? 0 : this.line(e - 1).to));
    }
    return new jl(i);
  }
  /**
  Return the document as a string, using newline characters to
  separate lines.
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let t = [];
    return this.flatten(t), t;
  }
  /**
  @internal
  */
  constructor() {
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(t) {
    if (t.length == 0)
      throw new RangeError("A document must have at least one line");
    return t.length == 1 && !t[0] ? V.empty : t.length <= 32 ? new J(t) : Ut.from(J.split(t, []));
  }
}
class J extends V {
  constructor(t, e = Nc(t)) {
    super(), this.text = t, this.length = e;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(t, e, i, s) {
    for (let r = 0; ; r++) {
      let o = this.text[r], l = s + o.length;
      if ((e ? i : l) >= t)
        return new Fc(s, l, i, o);
      s = l + 1, i++;
    }
  }
  decompose(t, e, i, s) {
    let r = t <= 0 && e >= this.length ? this : new J(oo(this.text, t, e), Math.min(e, this.length) - Math.max(0, t));
    if (s & 1) {
      let o = i.pop(), l = mn(r.text, o.text.slice(), 0, r.length);
      if (l.length <= 32)
        i.push(new J(l, o.length + r.length));
      else {
        let a = l.length >> 1;
        i.push(new J(l.slice(0, a)), new J(l.slice(a)));
      }
    } else
      i.push(r);
  }
  replace(t, e, i) {
    if (!(i instanceof J))
      return super.replace(t, e, i);
    [t, e] = _e(this, t, e);
    let s = mn(this.text, mn(i.text, oo(this.text, 0, t)), e), r = this.length + i.length - (e - t);
    return s.length <= 32 ? new J(s, r) : Ut.from(J.split(s, []), r);
  }
  sliceString(t, e = this.length, i = `
`) {
    [t, e] = _e(this, t, e);
    let s = "";
    for (let r = 0, o = 0; r <= e && o < this.text.length; o++) {
      let l = this.text[o], a = r + l.length;
      r > t && o && (s += i), t < a && e > r && (s += l.slice(Math.max(0, t - r), e - r)), r = a + 1;
    }
    return s;
  }
  flatten(t) {
    for (let e of this.text)
      t.push(e);
  }
  scanIdentical() {
    return 0;
  }
  static split(t, e) {
    let i = [], s = -1;
    for (let r of t)
      i.push(r), s += r.length + 1, i.length == 32 && (e.push(new J(i, s)), i = [], s = -1);
    return s > -1 && e.push(new J(i, s)), e;
  }
}
class Ut extends V {
  constructor(t, e) {
    super(), this.children = t, this.length = e, this.lines = 0;
    for (let i of t)
      this.lines += i.lines;
  }
  lineInner(t, e, i, s) {
    for (let r = 0; ; r++) {
      let o = this.children[r], l = s + o.length, a = i + o.lines - 1;
      if ((e ? a : l) >= t)
        return o.lineInner(t, e, i, s);
      s = l + 1, i = a + 1;
    }
  }
  decompose(t, e, i, s) {
    for (let r = 0, o = 0; o <= e && r < this.children.length; r++) {
      let l = this.children[r], a = o + l.length;
      if (t <= a && e >= o) {
        let c = s & ((o <= t ? 1 : 0) | (a >= e ? 2 : 0));
        o >= t && a <= e && !c ? i.push(l) : l.decompose(t - o, e - o, i, c);
      }
      o = a + 1;
    }
  }
  replace(t, e, i) {
    if ([t, e] = _e(this, t, e), i.lines < this.lines)
      for (let s = 0, r = 0; s < this.children.length; s++) {
        let o = this.children[s], l = r + o.length;
        if (t >= r && e <= l) {
          let a = o.replace(t - r, e - r, i), c = this.lines - o.lines + a.lines;
          if (a.lines < c >> 4 && a.lines > c >> 6) {
            let h = this.children.slice();
            return h[s] = a, new Ut(h, this.length - (e - t) + i.length);
          }
          return super.replace(r, l, a);
        }
        r = l + 1;
      }
    return super.replace(t, e, i);
  }
  sliceString(t, e = this.length, i = `
`) {
    [t, e] = _e(this, t, e);
    let s = "";
    for (let r = 0, o = 0; r < this.children.length && o <= e; r++) {
      let l = this.children[r], a = o + l.length;
      o > t && r && (s += i), t < a && e > o && (s += l.sliceString(t - o, e - o, i)), o = a + 1;
    }
    return s;
  }
  flatten(t) {
    for (let e of this.children)
      e.flatten(t);
  }
  scanIdentical(t, e) {
    if (!(t instanceof Ut))
      return 0;
    let i = 0, [s, r, o, l] = e > 0 ? [0, 0, this.children.length, t.children.length] : [this.children.length - 1, t.children.length - 1, -1, -1];
    for (; ; s += e, r += e) {
      if (s == o || r == l)
        return i;
      let a = this.children[s], c = t.children[r];
      if (a != c)
        return i + a.scanIdentical(c, e);
      i += a.length + 1;
    }
  }
  static from(t, e = t.reduce((i, s) => i + s.length + 1, -1)) {
    let i = 0;
    for (let d of t)
      i += d.lines;
    if (i < 32) {
      let d = [];
      for (let p of t)
        p.flatten(d);
      return new J(d, e);
    }
    let s = Math.max(
      32,
      i >> 5
      /* Tree.BranchShift */
    ), r = s << 1, o = s >> 1, l = [], a = 0, c = -1, h = [];
    function f(d) {
      let p;
      if (d.lines > r && d instanceof Ut)
        for (let g of d.children)
          f(g);
      else d.lines > o && (a > o || !a) ? (u(), l.push(d)) : d instanceof J && a && (p = h[h.length - 1]) instanceof J && d.lines + p.lines <= 32 ? (a += d.lines, c += d.length + 1, h[h.length - 1] = new J(p.text.concat(d.text), p.length + 1 + d.length)) : (a + d.lines > s && u(), a += d.lines, c += d.length + 1, h.push(d));
    }
    function u() {
      a != 0 && (l.push(h.length == 1 ? h[0] : Ut.from(h, c)), c = -1, a = h.length = 0);
    }
    for (let d of t)
      f(d);
    return u(), l.length == 1 ? l[0] : new Ut(l, e);
  }
}
V.empty = /* @__PURE__ */ new J([""], 0);
function Nc(n) {
  let t = -1;
  for (let e of n)
    t += e.length + 1;
  return t;
}
function mn(n, t, e = 0, i = 1e9) {
  for (let s = 0, r = 0, o = !0; r < n.length && s <= i; r++) {
    let l = n[r], a = s + l.length;
    a >= e && (a > i && (l = l.slice(0, i - s)), s < e && (l = l.slice(e - s)), o ? (t[t.length - 1] += l, o = !1) : t.push(l)), s = a + 1;
  }
  return t;
}
function oo(n, t, e) {
  return mn(n, [""], t, e);
}
class yi {
  constructor(t, e = 1) {
    this.dir = e, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [t], this.offsets = [e > 0 ? 1 : (t instanceof J ? t.text.length : t.children.length) << 1];
  }
  nextInner(t, e) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, s = this.nodes[i], r = this.offsets[i], o = r >> 1, l = s instanceof J ? s.text.length : s.children.length;
      if (o == (e > 0 ? l : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        e > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((r & 1) == (e > 0 ? 0 : 1)) {
        if (this.offsets[i] += e, t == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        t--;
      } else if (s instanceof J) {
        let a = s.text[o + (e < 0 ? -1 : 0)];
        if (this.offsets[i] += e, a.length > Math.max(0, t))
          return this.value = t == 0 ? a : e > 0 ? a.slice(t) : a.slice(0, a.length - t), this;
        t -= a.length;
      } else {
        let a = s.children[o + (e < 0 ? -1 : 0)];
        t > a.length ? (t -= a.length, this.offsets[i] += e) : (e < 0 && this.offsets[i]--, this.nodes.push(a), this.offsets.push(e > 0 ? 1 : (a instanceof J ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(t = 0) {
    return t < 0 && (this.nextInner(-t, -this.dir), t = this.value.length), this.nextInner(t, this.dir);
  }
}
class Kl {
  constructor(t, e, i) {
    this.value = "", this.done = !1, this.cursor = new yi(t, e > i ? -1 : 1), this.pos = e > i ? t.length : 0, this.from = Math.min(e, i), this.to = Math.max(e, i);
  }
  nextInner(t, e) {
    if (e < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    t += Math.max(0, e < 0 ? this.pos - this.to : this.from - this.pos);
    let i = e < 0 ? this.pos - this.from : this.to - this.pos;
    t > i && (t = i), i -= t;
    let { value: s } = this.cursor.next(t);
    return this.pos += (s.length + t) * e, this.value = s.length <= i ? s : e < 0 ? s.slice(s.length - i) : s.slice(0, i), this.done = !this.value, this;
  }
  next(t = 0) {
    return t < 0 ? t = Math.max(t, this.from - this.pos) : t > 0 && (t = Math.min(t, this.to - this.pos)), this.nextInner(t, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class jl {
  constructor(t) {
    this.inner = t, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(t = 0) {
    let { done: e, lineBreak: i, value: s } = this.inner.next(t);
    return e && this.afterBreak ? (this.value = "", this.afterBreak = !1) : e ? (this.done = !0, this.value = "") : i ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = s, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (V.prototype[Symbol.iterator] = function() {
  return this.iter();
}, yi.prototype[Symbol.iterator] = Kl.prototype[Symbol.iterator] = jl.prototype[Symbol.iterator] = function() {
  return this;
});
class Fc {
  /**
  @internal
  */
  constructor(t, e, i, s) {
    this.from = t, this.to = e, this.number = i, this.text = s;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
}
function _e(n, t, e) {
  return t = Math.max(0, Math.min(n.length, t)), [t, Math.max(t, Math.min(n.length, e))];
}
let $e = /* @__PURE__ */ "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((n) => n ? parseInt(n, 36) : 1);
for (let n = 1; n < $e.length; n++)
  $e[n] += $e[n - 1];
function Hc(n) {
  for (let t = 1; t < $e.length; t += 2)
    if ($e[t] > n)
      return $e[t - 1] <= n;
  return !1;
}
function lo(n) {
  return n >= 127462 && n <= 127487;
}
const ao = 8205;
function lt(n, t, e = !0, i = !0) {
  return (e ? Ul : Vc)(n, t, i);
}
function Ul(n, t, e) {
  if (t == n.length)
    return t;
  t && Gl(n.charCodeAt(t)) && Yl(n.charCodeAt(t - 1)) && t--;
  let i = st(n, t);
  for (t += Bt(i); t < n.length; ) {
    let s = st(n, t);
    if (i == ao || s == ao || e && Hc(s))
      t += Bt(s), i = s;
    else if (lo(s)) {
      let r = 0, o = t - 2;
      for (; o >= 0 && lo(st(n, o)); )
        r++, o -= 2;
      if (r % 2 == 0)
        break;
      t += 2;
    } else
      break;
  }
  return t;
}
function Vc(n, t, e) {
  for (; t > 0; ) {
    let i = Ul(n, t - 2, e);
    if (i < t)
      return i;
    t--;
  }
  return 0;
}
function Gl(n) {
  return n >= 56320 && n < 57344;
}
function Yl(n) {
  return n >= 55296 && n < 56320;
}
function st(n, t) {
  let e = n.charCodeAt(t);
  if (!Yl(e) || t + 1 == n.length)
    return e;
  let i = n.charCodeAt(t + 1);
  return Gl(i) ? (e - 55296 << 10) + (i - 56320) + 65536 : e;
}
function Mr(n) {
  return n <= 65535 ? String.fromCharCode(n) : (n -= 65536, String.fromCharCode((n >> 10) + 55296, (n & 1023) + 56320));
}
function Bt(n) {
  return n < 65536 ? 1 : 2;
}
const Ls = /\r\n?|\n/;
var mt = /* @__PURE__ */ function(n) {
  return n[n.Simple = 0] = "Simple", n[n.TrackDel = 1] = "TrackDel", n[n.TrackBefore = 2] = "TrackBefore", n[n.TrackAfter = 3] = "TrackAfter", n;
}(mt || (mt = {}));
class Xt {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(t) {
    this.sections = t;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let t = 0;
    for (let e = 0; e < this.sections.length; e += 2)
      t += this.sections[e];
    return t;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let t = 0;
    for (let e = 0; e < this.sections.length; e += 2) {
      let i = this.sections[e + 1];
      t += i < 0 ? this.sections[e] : i;
    }
    return t;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(t) {
    for (let e = 0, i = 0, s = 0; e < this.sections.length; ) {
      let r = this.sections[e++], o = this.sections[e++];
      o < 0 ? (t(i, s, r), s += r) : s += o, i += r;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(t, e = !1) {
    Rs(this, t, e);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let t = [];
    for (let e = 0; e < this.sections.length; ) {
      let i = this.sections[e++], s = this.sections[e++];
      s < 0 ? t.push(i, s) : t.push(s, i);
    }
    return new Xt(t);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(t) {
    return this.empty ? t : t.empty ? this : _l(this, t);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `other` happened before the ones in `this`.
  */
  mapDesc(t, e = !1) {
    return t.empty ? this : Ps(this, t, e);
  }
  mapPos(t, e = -1, i = mt.Simple) {
    let s = 0, r = 0;
    for (let o = 0; o < this.sections.length; ) {
      let l = this.sections[o++], a = this.sections[o++], c = s + l;
      if (a < 0) {
        if (c > t)
          return r + (t - s);
        r += l;
      } else {
        if (i != mt.Simple && c >= t && (i == mt.TrackDel && s < t && c > t || i == mt.TrackBefore && s < t || i == mt.TrackAfter && c > t))
          return null;
        if (c > t || c == t && e < 0 && !l)
          return t == s || e < 0 ? r : r + a;
        r += a;
      }
      s = c;
    }
    if (t > s)
      throw new RangeError(`Position ${t} is out of range for changeset of length ${s}`);
    return r;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(t, e = t) {
    for (let i = 0, s = 0; i < this.sections.length && s <= e; ) {
      let r = this.sections[i++], o = this.sections[i++], l = s + r;
      if (o >= 0 && s <= e && l >= t)
        return s < t && l > e ? "cover" : !0;
      s = l;
    }
    return !1;
  }
  /**
  @internal
  */
  toString() {
    let t = "";
    for (let e = 0; e < this.sections.length; ) {
      let i = this.sections[e++], s = this.sections[e++];
      t += (t ? " " : "") + i + (s >= 0 ? ":" + s : "");
    }
    return t;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(t) {
    if (!Array.isArray(t) || t.length % 2 || t.some((e) => typeof e != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new Xt(t);
  }
  /**
  @internal
  */
  static create(t) {
    return new Xt(t);
  }
}
class Z extends Xt {
  constructor(t, e) {
    super(t), this.inserted = e;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(t) {
    if (this.length != t.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return Rs(this, (e, i, s, r, o) => t = t.replace(s, s + (i - e), o), !1), t;
  }
  mapDesc(t, e = !1) {
    return Ps(this, t, e, !0);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(t) {
    let e = this.sections.slice(), i = [];
    for (let s = 0, r = 0; s < e.length; s += 2) {
      let o = e[s], l = e[s + 1];
      if (l >= 0) {
        e[s] = l, e[s + 1] = o;
        let a = s >> 1;
        for (; i.length < a; )
          i.push(V.empty);
        i.push(o ? t.slice(r, r + o) : V.empty);
      }
      r += o;
    }
    return new Z(e, i);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(t) {
    return this.empty ? t : t.empty ? this : _l(this, t, !0);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(t, e = !1) {
    return t.empty ? this : Ps(this, t, e, !0);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(t, e = !1) {
    Rs(this, t, e);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return Xt.create(this.sections);
  }
  /**
  @internal
  */
  filter(t) {
    let e = [], i = [], s = [], r = new ki(this);
    t: for (let o = 0, l = 0; ; ) {
      let a = o == t.length ? 1e9 : t[o++];
      for (; l < a || l == a && r.len == 0; ) {
        if (r.done)
          break t;
        let h = Math.min(r.len, a - l);
        ht(s, h, -1);
        let f = r.ins == -1 ? -1 : r.off == 0 ? r.ins : 0;
        ht(e, h, f), f > 0 && ce(i, e, r.text), r.forward(h), l += h;
      }
      let c = t[o++];
      for (; l < c; ) {
        if (r.done)
          break t;
        let h = Math.min(r.len, c - l);
        ht(e, h, -1), ht(s, h, r.ins == -1 ? -1 : r.off == 0 ? r.ins : 0), r.forward(h), l += h;
      }
    }
    return {
      changes: new Z(e, i),
      filtered: Xt.create(s)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let t = [];
    for (let e = 0; e < this.sections.length; e += 2) {
      let i = this.sections[e], s = this.sections[e + 1];
      s < 0 ? t.push(i) : s == 0 ? t.push([i]) : t.push([i].concat(this.inserted[e >> 1].toJSON()));
    }
    return t;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(t, e, i) {
    let s = [], r = [], o = 0, l = null;
    function a(h = !1) {
      if (!h && !s.length)
        return;
      o < e && ht(s, e - o, -1);
      let f = new Z(s, r);
      l = l ? l.compose(f.map(l)) : f, s = [], r = [], o = 0;
    }
    function c(h) {
      if (Array.isArray(h))
        for (let f of h)
          c(f);
      else if (h instanceof Z) {
        if (h.length != e)
          throw new RangeError(`Mismatched change set length (got ${h.length}, expected ${e})`);
        a(), l = l ? l.compose(h.map(l)) : h;
      } else {
        let { from: f, to: u = f, insert: d } = h;
        if (f > u || f < 0 || u > e)
          throw new RangeError(`Invalid change range ${f} to ${u} (in doc of length ${e})`);
        let p = d ? typeof d == "string" ? V.of(d.split(i || Ls)) : d : V.empty, g = p.length;
        if (f == u && g == 0)
          return;
        f < o && a(), f > o && ht(s, f - o, -1), ht(s, u - f, g), ce(r, s, p), o = u;
      }
    }
    return c(t), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(t) {
    return new Z(t ? [t, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(t) {
    if (!Array.isArray(t))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let e = [], i = [];
    for (let s = 0; s < t.length; s++) {
      let r = t[s];
      if (typeof r == "number")
        e.push(r, -1);
      else {
        if (!Array.isArray(r) || typeof r[0] != "number" || r.some((o, l) => l && typeof o != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (r.length == 1)
          e.push(r[0], 0);
        else {
          for (; i.length < s; )
            i.push(V.empty);
          i[s] = V.of(r.slice(1)), e.push(r[0], i[s].length);
        }
      }
    }
    return new Z(e, i);
  }
  /**
  @internal
  */
  static createSet(t, e) {
    return new Z(t, e);
  }
}
function ht(n, t, e, i = !1) {
  if (t == 0 && e <= 0)
    return;
  let s = n.length - 2;
  s >= 0 && e <= 0 && e == n[s + 1] ? n[s] += t : t == 0 && n[s] == 0 ? n[s + 1] += e : i ? (n[s] += t, n[s + 1] += e) : n.push(t, e);
}
function ce(n, t, e) {
  if (e.length == 0)
    return;
  let i = t.length - 2 >> 1;
  if (i < n.length)
    n[n.length - 1] = n[n.length - 1].append(e);
  else {
    for (; n.length < i; )
      n.push(V.empty);
    n.push(e);
  }
}
function Rs(n, t, e) {
  let i = n.inserted;
  for (let s = 0, r = 0, o = 0; o < n.sections.length; ) {
    let l = n.sections[o++], a = n.sections[o++];
    if (a < 0)
      s += l, r += l;
    else {
      let c = s, h = r, f = V.empty;
      for (; c += l, h += a, a && i && (f = f.append(i[o - 2 >> 1])), !(e || o == n.sections.length || n.sections[o + 1] < 0); )
        l = n.sections[o++], a = n.sections[o++];
      t(s, c, r, h, f), s = c, r = h;
    }
  }
}
function Ps(n, t, e, i = !1) {
  let s = [], r = i ? [] : null, o = new ki(n), l = new ki(t);
  for (let a = -1; ; )
    if (o.ins == -1 && l.ins == -1) {
      let c = Math.min(o.len, l.len);
      ht(s, c, -1), o.forward(c), l.forward(c);
    } else if (l.ins >= 0 && (o.ins < 0 || a == o.i || o.off == 0 && (l.len < o.len || l.len == o.len && !e))) {
      let c = l.len;
      for (ht(s, l.ins, -1); c; ) {
        let h = Math.min(o.len, c);
        o.ins >= 0 && a < o.i && o.len <= h && (ht(s, 0, o.ins), r && ce(r, s, o.text), a = o.i), o.forward(h), c -= h;
      }
      l.next();
    } else if (o.ins >= 0) {
      let c = 0, h = o.len;
      for (; h; )
        if (l.ins == -1) {
          let f = Math.min(h, l.len);
          c += f, h -= f, l.forward(f);
        } else if (l.ins == 0 && l.len < h)
          h -= l.len, l.next();
        else
          break;
      ht(s, c, a < o.i ? o.ins : 0), r && a < o.i && ce(r, s, o.text), a = o.i, o.forward(o.len - h);
    } else {
      if (o.done && l.done)
        return r ? Z.createSet(s, r) : Xt.create(s);
      throw new Error("Mismatched change set lengths");
    }
}
function _l(n, t, e = !1) {
  let i = [], s = e ? [] : null, r = new ki(n), o = new ki(t);
  for (let l = !1; ; ) {
    if (r.done && o.done)
      return s ? Z.createSet(i, s) : Xt.create(i);
    if (r.ins == 0)
      ht(i, r.len, 0, l), r.next();
    else if (o.len == 0 && !o.done)
      ht(i, 0, o.ins, l), s && ce(s, i, o.text), o.next();
    else {
      if (r.done || o.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(r.len2, o.len), c = i.length;
        if (r.ins == -1) {
          let h = o.ins == -1 ? -1 : o.off ? 0 : o.ins;
          ht(i, a, h, l), s && h && ce(s, i, o.text);
        } else o.ins == -1 ? (ht(i, r.off ? 0 : r.len, a, l), s && ce(s, i, r.textBit(a))) : (ht(i, r.off ? 0 : r.len, o.off ? 0 : o.ins, l), s && !o.off && ce(s, i, o.text));
        l = (r.ins > a || o.ins >= 0 && o.len > a) && (l || i.length > c), r.forward2(a), o.forward(a);
      }
    }
  }
}
class ki {
  constructor(t) {
    this.set = t, this.i = 0, this.next();
  }
  next() {
    let { sections: t } = this.set;
    this.i < t.length ? (this.len = t[this.i++], this.ins = t[this.i++]) : (this.len = 0, this.ins = -2), this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted: t } = this.set, e = this.i - 2 >> 1;
    return e >= t.length ? V.empty : t[e];
  }
  textBit(t) {
    let { inserted: e } = this.set, i = this.i - 2 >> 1;
    return i >= e.length && !t ? V.empty : e[i].slice(this.off, t == null ? void 0 : this.off + t);
  }
  forward(t) {
    t == this.len ? this.next() : (this.len -= t, this.off += t);
  }
  forward2(t) {
    this.ins == -1 ? this.forward(t) : t == this.ins ? this.next() : (this.ins -= t, this.off += t);
  }
}
class Oe {
  constructor(t, e, i) {
    this.from = t, this.to = e, this.flags = i;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 32 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 32 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let t = this.flags & 7;
    return t == 7 ? null : t;
  }
  /**
  The goal column (stored vertical offset) associated with a
  cursor. This is used to preserve the vertical position when
  [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
  lines of different length.
  */
  get goalColumn() {
    let t = this.flags >> 6;
    return t == 16777215 ? void 0 : t;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(t, e = -1) {
    let i, s;
    return this.empty ? i = s = t.mapPos(this.from, e) : (i = t.mapPos(this.from, 1), s = t.mapPos(this.to, -1)), i == this.from && s == this.to ? this : new Oe(i, s, this.flags);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(t, e = t) {
    if (t <= this.anchor && e >= this.anchor)
      return x.range(t, e);
    let i = Math.abs(t - this.anchor) > Math.abs(e - this.anchor) ? t : e;
    return x.range(this.anchor, i);
  }
  /**
  Compare this range to another range.
  */
  eq(t, e = !1) {
    return this.anchor == t.anchor && this.head == t.head && (!e || !this.empty || this.assoc == t.assoc);
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(t) {
    if (!t || typeof t.anchor != "number" || typeof t.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return x.range(t.anchor, t.head);
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new Oe(t, e, i);
  }
}
class x {
  constructor(t, e) {
    this.ranges = t, this.mainIndex = e;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(t, e = -1) {
    return t.empty ? this : x.create(this.ranges.map((i) => i.map(t, e)), this.mainIndex);
  }
  /**
  Compare this selection to another selection. By default, ranges
  are compared only by position. When `includeAssoc` is true,
  cursor ranges must also have the same
  [`assoc`](https://codemirror.net/6/docs/ref/#state.SelectionRange.assoc) value.
  */
  eq(t, e = !1) {
    if (this.ranges.length != t.ranges.length || this.mainIndex != t.mainIndex)
      return !1;
    for (let i = 0; i < this.ranges.length; i++)
      if (!this.ranges[i].eq(t.ranges[i], e))
        return !1;
    return !0;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new x([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(t, e = !0) {
    return x.create([t].concat(this.ranges), e ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(t, e = this.mainIndex) {
    let i = this.ranges.slice();
    return i[e] = t, x.create(i, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((t) => t.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(t) {
    if (!t || !Array.isArray(t.ranges) || typeof t.main != "number" || t.main >= t.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new x(t.ranges.map((e) => Oe.fromJSON(e)), t.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(t, e = t) {
    return new x([x.range(t, e)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(t, e = 0) {
    if (t.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let i = 0, s = 0; s < t.length; s++) {
      let r = t[s];
      if (r.empty ? r.from <= i : r.from < i)
        return x.normalized(t.slice(), e);
      i = r.to;
    }
    return new x(t, e);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(t, e = 0, i, s) {
    return Oe.create(t, t, (e == 0 ? 0 : e < 0 ? 8 : 16) | (i == null ? 7 : Math.min(6, i)) | (s ?? 16777215) << 6);
  }
  /**
  Create a selection range.
  */
  static range(t, e, i, s) {
    let r = (i ?? 16777215) << 6 | (s == null ? 7 : Math.min(6, s));
    return e < t ? Oe.create(e, t, 48 | r) : Oe.create(t, e, (e > t ? 8 : 0) | r);
  }
  /**
  @internal
  */
  static normalized(t, e = 0) {
    let i = t[e];
    t.sort((s, r) => s.from - r.from), e = t.indexOf(i);
    for (let s = 1; s < t.length; s++) {
      let r = t[s], o = t[s - 1];
      if (r.empty ? r.from <= o.to : r.from < o.to) {
        let l = o.from, a = Math.max(r.to, o.to);
        s <= e && e--, t.splice(--s, 2, r.anchor > r.head ? x.range(a, l) : x.range(l, a));
      }
    }
    return new x(t, e);
  }
}
function Jl(n, t) {
  for (let e of n.ranges)
    if (e.to > t)
      throw new RangeError("Selection points outside of document");
}
let Dr = 0;
class O {
  constructor(t, e, i, s, r) {
    this.combine = t, this.compareInput = e, this.compare = i, this.isStatic = s, this.id = Dr++, this.default = t([]), this.extensions = typeof r == "function" ? r(this) : r;
  }
  /**
  Returns a facet reader for this facet, which can be used to
  [read](https://codemirror.net/6/docs/ref/#state.EditorState.facet) it but not to define values for it.
  */
  get reader() {
    return this;
  }
  /**
  Define a new facet.
  */
  static define(t = {}) {
    return new O(t.combine || ((e) => e), t.compareInput || ((e, i) => e === i), t.compare || (t.combine ? (e, i) => e === i : Or), !!t.static, t.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(t) {
    return new gn([], this, 0, t);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(t, e) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new gn(t, this, 1, e);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(t, e) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new gn(t, this, 2, e);
  }
  from(t, e) {
    return e || (e = (i) => i), this.compute([t], (i) => e(i.field(t)));
  }
}
function Or(n, t) {
  return n == t || n.length == t.length && n.every((e, i) => e === t[i]);
}
class gn {
  constructor(t, e, i, s) {
    this.dependencies = t, this.facet = e, this.type = i, this.value = s, this.id = Dr++;
  }
  dynamicSlot(t) {
    var e;
    let i = this.value, s = this.facet.compareInput, r = this.id, o = t[r] >> 1, l = this.type == 2, a = !1, c = !1, h = [];
    for (let f of this.dependencies)
      f == "doc" ? a = !0 : f == "selection" ? c = !0 : ((e = t[f.id]) !== null && e !== void 0 ? e : 1) & 1 || h.push(t[f.id]);
    return {
      create(f) {
        return f.values[o] = i(f), 1;
      },
      update(f, u) {
        if (a && u.docChanged || c && (u.docChanged || u.selection) || Es(f, h)) {
          let d = i(f);
          if (l ? !ho(d, f.values[o], s) : !s(d, f.values[o]))
            return f.values[o] = d, 1;
        }
        return 0;
      },
      reconfigure: (f, u) => {
        let d, p = u.config.address[r];
        if (p != null) {
          let g = An(u, p);
          if (this.dependencies.every((y) => y instanceof O ? u.facet(y) === f.facet(y) : y instanceof at ? u.field(y, !1) == f.field(y, !1) : !0) || (l ? ho(d = i(f), g, s) : s(d = i(f), g)))
            return f.values[o] = g, 0;
        } else
          d = i(f);
        return f.values[o] = d, 1;
      }
    };
  }
}
function ho(n, t, e) {
  if (n.length != t.length)
    return !1;
  for (let i = 0; i < n.length; i++)
    if (!e(n[i], t[i]))
      return !1;
  return !0;
}
function Es(n, t) {
  let e = !1;
  for (let i of t)
    bi(n, i) & 1 && (e = !0);
  return e;
}
function Wc(n, t, e) {
  let i = e.map((a) => n[a.id]), s = e.map((a) => a.type), r = i.filter((a) => !(a & 1)), o = n[t.id] >> 1;
  function l(a) {
    let c = [];
    for (let h = 0; h < i.length; h++) {
      let f = An(a, i[h]);
      if (s[h] == 2)
        for (let u of f)
          c.push(u);
      else
        c.push(f);
    }
    return t.combine(c);
  }
  return {
    create(a) {
      for (let c of i)
        bi(a, c);
      return a.values[o] = l(a), 1;
    },
    update(a, c) {
      if (!Es(a, r))
        return 0;
      let h = l(a);
      return t.compare(h, a.values[o]) ? 0 : (a.values[o] = h, 1);
    },
    reconfigure(a, c) {
      let h = Es(a, i), f = c.config.facets[t.id], u = c.facet(t);
      if (f && !h && Or(e, f))
        return a.values[o] = u, 0;
      let d = l(a);
      return t.compare(d, u) ? (a.values[o] = u, 0) : (a.values[o] = d, 1);
    }
  };
}
const co = /* @__PURE__ */ O.define({ static: !0 });
class at {
  constructor(t, e, i, s, r) {
    this.id = t, this.createF = e, this.updateF = i, this.compareF = s, this.spec = r, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(t) {
    let e = new at(Dr++, t.create, t.update, t.compare || ((i, s) => i === s), t);
    return t.provide && (e.provides = t.provide(e)), e;
  }
  create(t) {
    let e = t.facet(co).find((i) => i.field == this);
    return ((e == null ? void 0 : e.create) || this.createF)(t);
  }
  /**
  @internal
  */
  slot(t) {
    let e = t[this.id] >> 1;
    return {
      create: (i) => (i.values[e] = this.create(i), 1),
      update: (i, s) => {
        let r = i.values[e], o = this.updateF(r, s);
        return this.compareF(r, o) ? 0 : (i.values[e] = o, 1);
      },
      reconfigure: (i, s) => s.config.address[this.id] != null ? (i.values[e] = s.field(this), 0) : (i.values[e] = this.create(i), 1)
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(t) {
    return [this, co.of({ field: this, create: t })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
}
const Me = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function ri(n) {
  return (t) => new Xl(t, n);
}
const Ne = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ ri(Me.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ ri(Me.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ ri(Me.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ ri(Me.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ ri(Me.lowest)
};
class Xl {
  constructor(t, e) {
    this.inner = t, this.prec = e;
  }
}
class _n {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(t) {
    return new Is(this, t);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(t) {
    return _n.reconfigure.of({ compartment: this, extension: t });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(t) {
    return t.config.compartments.get(this);
  }
}
class Is {
  constructor(t, e) {
    this.compartment = t, this.inner = e;
  }
}
class Cn {
  constructor(t, e, i, s, r, o) {
    for (this.base = t, this.compartments = e, this.dynamicSlots = i, this.address = s, this.staticValues = r, this.facets = o, this.statusTemplate = []; this.statusTemplate.length < i.length; )
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(t) {
    let e = this.address[t.id];
    return e == null ? t.default : this.staticValues[e >> 1];
  }
  static resolve(t, e, i) {
    let s = [], r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Map();
    for (let u of zc(t, e, o))
      u instanceof at ? s.push(u) : (r[u.facet.id] || (r[u.facet.id] = [])).push(u);
    let l = /* @__PURE__ */ Object.create(null), a = [], c = [];
    for (let u of s)
      l[u.id] = c.length << 1, c.push((d) => u.slot(d));
    let h = i == null ? void 0 : i.config.facets;
    for (let u in r) {
      let d = r[u], p = d[0].facet, g = h && h[u] || [];
      if (d.every(
        (y) => y.type == 0
        /* Provider.Static */
      ))
        if (l[p.id] = a.length << 1 | 1, Or(g, d))
          a.push(i.facet(p));
        else {
          let y = p.combine(d.map((b) => b.value));
          a.push(i && p.compare(y, i.facet(p)) ? i.facet(p) : y);
        }
      else {
        for (let y of d)
          y.type == 0 ? (l[y.id] = a.length << 1 | 1, a.push(y.value)) : (l[y.id] = c.length << 1, c.push((b) => y.dynamicSlot(b)));
        l[p.id] = c.length << 1, c.push((y) => Wc(y, p, d));
      }
    }
    let f = c.map((u) => u(l));
    return new Cn(t, o, f, l, a, r);
  }
}
function zc(n, t, e) {
  let i = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function r(o, l) {
    let a = s.get(o);
    if (a != null) {
      if (a <= l)
        return;
      let c = i[a].indexOf(o);
      c > -1 && i[a].splice(c, 1), o instanceof Is && e.delete(o.compartment);
    }
    if (s.set(o, l), Array.isArray(o))
      for (let c of o)
        r(c, l);
    else if (o instanceof Is) {
      if (e.has(o.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let c = t.get(o.compartment) || o.inner;
      e.set(o.compartment, c), r(c, l);
    } else if (o instanceof Xl)
      r(o.inner, o.prec);
    else if (o instanceof at)
      i[l].push(o), o.provides && r(o.provides, l);
    else if (o instanceof gn)
      i[l].push(o), o.facet.extensions && r(o.facet.extensions, Me.default);
    else {
      let c = o.extension;
      if (!c)
        throw new Error(`Unrecognized extension value in extension set (${o}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      r(c, l);
    }
  }
  return r(n, Me.default), i.reduce((o, l) => o.concat(l));
}
function bi(n, t) {
  if (t & 1)
    return 2;
  let e = t >> 1, i = n.status[e];
  if (i == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (i & 2)
    return i;
  n.status[e] = 4;
  let s = n.computeSlot(n, n.config.dynamicSlots[e]);
  return n.status[e] = 2 | s;
}
function An(n, t) {
  return t & 1 ? n.config.staticValues[t >> 1] : n.values[t >> 1];
}
const Ql = /* @__PURE__ */ O.define(), Ns = /* @__PURE__ */ O.define({
  combine: (n) => n.some((t) => t),
  static: !0
}), Zl = /* @__PURE__ */ O.define({
  combine: (n) => n.length ? n[0] : void 0,
  static: !0
}), ta = /* @__PURE__ */ O.define(), ea = /* @__PURE__ */ O.define(), ia = /* @__PURE__ */ O.define(), na = /* @__PURE__ */ O.define({
  combine: (n) => n.length ? n[0] : !1
});
class re {
  /**
  @internal
  */
  constructor(t, e) {
    this.type = t, this.value = e;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new qc();
  }
}
class qc {
  /**
  Create an instance of this annotation.
  */
  of(t) {
    return new re(this, t);
  }
}
class $c {
  /**
  @internal
  */
  constructor(t) {
    this.map = t;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(t) {
    return new R(this, t);
  }
}
class R {
  /**
  @internal
  */
  constructor(t, e) {
    this.type = t, this.value = e;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(t) {
    let e = this.type.map(this.value, t);
    return e === void 0 ? void 0 : e == this.value ? this : new R(this.type, e);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(t) {
    return this.type == t;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds. It should be a type that
  doesn't include `undefined`, since that is used in
  [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
  removed.
  */
  static define(t = {}) {
    return new $c(t.map || ((e) => e));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(t, e) {
    if (!t.length)
      return t;
    let i = [];
    for (let s of t) {
      let r = s.map(e);
      r && i.push(r);
    }
    return i;
  }
}
R.reconfigure = /* @__PURE__ */ R.define();
R.appendConfig = /* @__PURE__ */ R.define();
class tt {
  constructor(t, e, i, s, r, o) {
    this.startState = t, this.changes = e, this.selection = i, this.effects = s, this.annotations = r, this.scrollIntoView = o, this._doc = null, this._state = null, i && Jl(i, e.newLength), r.some((l) => l.type == tt.time) || (this.annotations = r.concat(tt.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(t, e, i, s, r, o) {
    return new tt(t, e, i, s, r, o);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    return this._state || this.startState.applyTransaction(this), this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(t) {
    for (let e of this.annotations)
      if (e.type == t)
        return e.value;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(t) {
    let e = this.annotation(tt.userEvent);
    return !!(e && (e == t || e.length > t.length && e.slice(0, t.length) == t && e[t.length] == "."));
  }
}
tt.time = /* @__PURE__ */ re.define();
tt.userEvent = /* @__PURE__ */ re.define();
tt.addToHistory = /* @__PURE__ */ re.define();
tt.remote = /* @__PURE__ */ re.define();
function Kc(n, t) {
  let e = [];
  for (let i = 0, s = 0; ; ) {
    let r, o;
    if (i < n.length && (s == t.length || t[s] >= n[i]))
      r = n[i++], o = n[i++];
    else if (s < t.length)
      r = t[s++], o = t[s++];
    else
      return e;
    !e.length || e[e.length - 1] < r ? e.push(r, o) : e[e.length - 1] < o && (e[e.length - 1] = o);
  }
}
function sa(n, t, e) {
  var i;
  let s, r, o;
  return e ? (s = t.changes, r = Z.empty(t.changes.length), o = n.changes.compose(t.changes)) : (s = t.changes.map(n.changes), r = n.changes.mapDesc(t.changes, !0), o = n.changes.compose(s)), {
    changes: o,
    selection: t.selection ? t.selection.map(r) : (i = n.selection) === null || i === void 0 ? void 0 : i.map(s),
    effects: R.mapEffects(n.effects, s).concat(R.mapEffects(t.effects, r)),
    annotations: n.annotations.length ? n.annotations.concat(t.annotations) : t.annotations,
    scrollIntoView: n.scrollIntoView || t.scrollIntoView
  };
}
function Fs(n, t, e) {
  let i = t.selection, s = Ke(t.annotations);
  return t.userEvent && (s = s.concat(tt.userEvent.of(t.userEvent))), {
    changes: t.changes instanceof Z ? t.changes : Z.of(t.changes || [], e, n.facet(Zl)),
    selection: i && (i instanceof x ? i : x.single(i.anchor, i.head)),
    effects: Ke(t.effects),
    annotations: s,
    scrollIntoView: !!t.scrollIntoView
  };
}
function ra(n, t, e) {
  let i = Fs(n, t.length ? t[0] : {}, n.doc.length);
  t.length && t[0].filter === !1 && (e = !1);
  for (let r = 1; r < t.length; r++) {
    t[r].filter === !1 && (e = !1);
    let o = !!t[r].sequential;
    i = sa(i, Fs(n, t[r], o ? i.changes.newLength : n.doc.length), o);
  }
  let s = tt.create(n, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return Uc(e ? jc(s) : s);
}
function jc(n) {
  let t = n.startState, e = !0;
  for (let s of t.facet(ta)) {
    let r = s(n);
    if (r === !1) {
      e = !1;
      break;
    }
    Array.isArray(r) && (e = e === !0 ? r : Kc(e, r));
  }
  if (e !== !0) {
    let s, r;
    if (e === !1)
      r = n.changes.invertedDesc, s = Z.empty(t.doc.length);
    else {
      let o = n.changes.filter(e);
      s = o.changes, r = o.filtered.mapDesc(o.changes).invertedDesc;
    }
    n = tt.create(t, s, n.selection && n.selection.map(r), R.mapEffects(n.effects, r), n.annotations, n.scrollIntoView);
  }
  let i = t.facet(ea);
  for (let s = i.length - 1; s >= 0; s--) {
    let r = i[s](n);
    r instanceof tt ? n = r : Array.isArray(r) && r.length == 1 && r[0] instanceof tt ? n = r[0] : n = ra(t, Ke(r), !1);
  }
  return n;
}
function Uc(n) {
  let t = n.startState, e = t.facet(ia), i = n;
  for (let s = e.length - 1; s >= 0; s--) {
    let r = e[s](n);
    r && Object.keys(r).length && (i = sa(i, Fs(t, r, n.changes.newLength), !0));
  }
  return i == n ? n : tt.create(t, n.changes, n.selection, i.effects, i.annotations, i.scrollIntoView);
}
const Gc = [];
function Ke(n) {
  return n == null ? Gc : Array.isArray(n) ? n : [n];
}
var _ = /* @__PURE__ */ function(n) {
  return n[n.Word = 0] = "Word", n[n.Space = 1] = "Space", n[n.Other = 2] = "Other", n;
}(_ || (_ = {}));
const Yc = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let Hs;
try {
  Hs = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function _c(n) {
  if (Hs)
    return Hs.test(n);
  for (let t = 0; t < n.length; t++) {
    let e = n[t];
    if (/\w/.test(e) || e > "" && (e.toUpperCase() != e.toLowerCase() || Yc.test(e)))
      return !0;
  }
  return !1;
}
function Jc(n) {
  return (t) => {
    if (!/\S/.test(t))
      return _.Space;
    if (_c(t))
      return _.Word;
    for (let e = 0; e < n.length; e++)
      if (t.indexOf(n[e]) > -1)
        return _.Word;
    return _.Other;
  };
}
class F {
  constructor(t, e, i, s, r, o) {
    this.config = t, this.doc = e, this.selection = i, this.values = s, this.status = t.statusTemplate.slice(), this.computeSlot = r, o && (o._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      bi(this, l << 1);
    this.computeSlot = null;
  }
  field(t, e = !0) {
    let i = this.config.address[t.id];
    if (i == null) {
      if (e)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return bi(this, i), An(this, i);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...t) {
    return ra(this, t, !0);
  }
  /**
  @internal
  */
  applyTransaction(t) {
    let e = this.config, { base: i, compartments: s } = e;
    for (let l of t.effects)
      l.is(_n.reconfigure) ? (e && (s = /* @__PURE__ */ new Map(), e.compartments.forEach((a, c) => s.set(c, a)), e = null), s.set(l.value.compartment, l.value.extension)) : l.is(R.reconfigure) ? (e = null, i = l.value) : l.is(R.appendConfig) && (e = null, i = Ke(i).concat(l.value));
    let r;
    e ? r = t.startState.values.slice() : (e = Cn.resolve(i, s, this), r = new F(e, this.doc, this.selection, e.dynamicSlots.map(() => null), (a, c) => c.reconfigure(a, this), null).values);
    let o = t.startState.facet(Ns) ? t.newSelection : t.newSelection.asSingle();
    new F(e, t.newDoc, o, r, (l, a) => a.update(l, t), t);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(t) {
    return typeof t == "string" && (t = this.toText(t)), this.changeByRange((e) => ({
      changes: { from: e.from, to: e.to, insert: t },
      range: x.cursor(e.from + t.length)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(t) {
    let e = this.selection, i = t(e.ranges[0]), s = this.changes(i.changes), r = [i.range], o = Ke(i.effects);
    for (let l = 1; l < e.ranges.length; l++) {
      let a = t(e.ranges[l]), c = this.changes(a.changes), h = c.map(s);
      for (let u = 0; u < l; u++)
        r[u] = r[u].map(h);
      let f = s.mapDesc(c, !0);
      r.push(a.range.map(f)), s = s.compose(h), o = R.mapEffects(o, h).concat(R.mapEffects(Ke(a.effects), f));
    }
    return {
      changes: s,
      selection: x.create(r, e.mainIndex),
      effects: o
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(t = []) {
    return t instanceof Z ? t : Z.of(t, this.doc.length, this.facet(F.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(t) {
    return V.of(t.split(this.facet(F.lineSeparator) || Ls));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(t = 0, e = this.doc.length) {
    return this.doc.sliceString(t, e, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(t) {
    let e = this.config.address[t.id];
    return e == null ? t.default : (bi(this, e), An(this, e));
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(t) {
    let e = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (t)
      for (let i in t) {
        let s = t[i];
        s instanceof at && this.config.address[s.id] != null && (e[i] = s.spec.toJSON(this.field(t[i]), this));
      }
    return e;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(t, e = {}, i) {
    if (!t || typeof t.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let s = [];
    if (i) {
      for (let r in i)
        if (Object.prototype.hasOwnProperty.call(t, r)) {
          let o = i[r], l = t[r];
          s.push(o.init((a) => o.spec.fromJSON(l, a)));
        }
    }
    return F.create({
      doc: t.doc,
      selection: x.fromJSON(t.selection),
      extensions: e.extensions ? s.concat([e.extensions]) : s
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(t = {}) {
    let e = Cn.resolve(t.extensions || [], /* @__PURE__ */ new Map()), i = t.doc instanceof V ? t.doc : V.of((t.doc || "").split(e.staticFacet(F.lineSeparator) || Ls)), s = t.selection ? t.selection instanceof x ? t.selection : x.single(t.selection.anchor, t.selection.head) : x.single(0);
    return Jl(s, i.length), e.staticFacet(Ns) || (s = s.asSingle()), new F(e, i, s, e.dynamicSlots.map(() => null), (r, o) => o.create(r), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(F.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(F.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(na);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(t, ...e) {
    for (let i of this.facet(F.phrases))
      if (Object.prototype.hasOwnProperty.call(i, t)) {
        t = i[t];
        break;
      }
    return e.length && (t = t.replace(/\$(\$|\d*)/g, (i, s) => {
      if (s == "$")
        return "$";
      let r = +(s || 1);
      return !r || r > e.length ? i : e[r - 1];
    })), t;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(t, e, i = -1) {
    let s = [];
    for (let r of this.facet(Ql))
      for (let o of r(this, e, i))
        Object.prototype.hasOwnProperty.call(o, t) && s.push(o[t]);
    return s;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(t) {
    return Jc(this.languageDataAt("wordChars", t).join(""));
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(t) {
    let { text: e, from: i, length: s } = this.doc.lineAt(t), r = this.charCategorizer(t), o = t - i, l = t - i;
    for (; o > 0; ) {
      let a = lt(e, o, !1);
      if (r(e.slice(a, o)) != _.Word)
        break;
      o = a;
    }
    for (; l < s; ) {
      let a = lt(e, l);
      if (r(e.slice(l, a)) != _.Word)
        break;
      l = a;
    }
    return o == l ? null : x.range(o + i, l + i);
  }
}
F.allowMultipleSelections = Ns;
F.tabSize = /* @__PURE__ */ O.define({
  combine: (n) => n.length ? n[0] : 4
});
F.lineSeparator = Zl;
F.readOnly = na;
F.phrases = /* @__PURE__ */ O.define({
  compare(n, t) {
    let e = Object.keys(n), i = Object.keys(t);
    return e.length == i.length && e.every((s) => n[s] == t[s]);
  }
});
F.languageData = Ql;
F.changeFilter = ta;
F.transactionFilter = ea;
F.transactionExtender = ia;
_n.reconfigure = /* @__PURE__ */ R.define();
function Zt(n, t, e = {}) {
  let i = {};
  for (let s of n)
    for (let r of Object.keys(s)) {
      let o = s[r], l = i[r];
      if (l === void 0)
        i[r] = o;
      else if (!(l === o || o === void 0)) if (Object.hasOwnProperty.call(e, r))
        i[r] = e[r](l, o);
      else
        throw new Error("Config merge conflict for field " + r);
    }
  for (let s in t)
    i[s] === void 0 && (i[s] = t[s]);
  return i;
}
class Le {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(t) {
    return this == t;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(t, e = t) {
    return Vs.create(t, e, this);
  }
}
Le.prototype.startSide = Le.prototype.endSide = 0;
Le.prototype.point = !1;
Le.prototype.mapMode = mt.TrackDel;
let Vs = class oa {
  constructor(t, e, i) {
    this.from = t, this.to = e, this.value = i;
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new oa(t, e, i);
  }
};
function Ws(n, t) {
  return n.from - t.from || n.value.startSide - t.value.startSide;
}
class Tr {
  constructor(t, e, i, s) {
    this.from = t, this.to = e, this.value = i, this.maxPoint = s;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(t, e, i, s = 0) {
    let r = i ? this.to : this.from;
    for (let o = s, l = r.length; ; ) {
      if (o == l)
        return o;
      let a = o + l >> 1, c = r[a] - t || (i ? this.value[a].endSide : this.value[a].startSide) - e;
      if (a == o)
        return c >= 0 ? o : l;
      c >= 0 ? l = a : o = a + 1;
    }
  }
  between(t, e, i, s) {
    for (let r = this.findIndex(e, -1e9, !0), o = this.findIndex(i, 1e9, !1, r); r < o; r++)
      if (s(this.from[r] + t, this.to[r] + t, this.value[r]) === !1)
        return !1;
  }
  map(t, e) {
    let i = [], s = [], r = [], o = -1, l = -1;
    for (let a = 0; a < this.value.length; a++) {
      let c = this.value[a], h = this.from[a] + t, f = this.to[a] + t, u, d;
      if (h == f) {
        let p = e.mapPos(h, c.startSide, c.mapMode);
        if (p == null || (u = d = p, c.startSide != c.endSide && (d = e.mapPos(h, c.endSide), d < u)))
          continue;
      } else if (u = e.mapPos(h, c.startSide), d = e.mapPos(f, c.endSide), u > d || u == d && c.startSide > 0 && c.endSide <= 0)
        continue;
      (d - u || c.endSide - c.startSide) < 0 || (o < 0 && (o = u), c.point && (l = Math.max(l, d - u)), i.push(c), s.push(u - o), r.push(d - o));
    }
    return { mapped: i.length ? new Tr(s, r, i, l) : null, pos: o };
  }
}
class H {
  constructor(t, e, i, s) {
    this.chunkPos = t, this.chunk = e, this.nextLayer = i, this.maxPoint = s;
  }
  /**
  @internal
  */
  static create(t, e, i, s) {
    return new H(t, e, i, s);
  }
  /**
  @internal
  */
  get length() {
    let t = this.chunk.length - 1;
    return t < 0 ? 0 : Math.max(this.chunkEnd(t), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let t = this.nextLayer.size;
    for (let e of this.chunk)
      t += e.value.length;
    return t;
  }
  /**
  @internal
  */
  chunkEnd(t) {
    return this.chunkPos[t] + this.chunk[t].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(t) {
    let { add: e = [], sort: i = !1, filterFrom: s = 0, filterTo: r = this.length } = t, o = t.filter;
    if (e.length == 0 && !o)
      return this;
    if (i && (e = e.slice().sort(Ws)), this.isEmpty)
      return e.length ? H.of(e) : this;
    let l = new la(this, null, -1).goto(0), a = 0, c = [], h = new ge();
    for (; l.value || a < e.length; )
      if (a < e.length && (l.from - e[a].from || l.startSide - e[a].value.startSide) >= 0) {
        let f = e[a++];
        h.addInner(f.from, f.to, f.value) || c.push(f);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == e.length || this.chunkEnd(l.chunkIndex) < e[a].from) && (!o || s > this.chunkEnd(l.chunkIndex) || r < this.chunkPos[l.chunkIndex]) && h.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!o || s > l.to || r < l.from || o(l.from, l.to, l.value)) && (h.addInner(l.from, l.to, l.value) || c.push(Vs.create(l.from, l.to, l.value))), l.next());
    return h.finishInner(this.nextLayer.isEmpty && !c.length ? H.empty : this.nextLayer.update({ add: c, filter: o, filterFrom: s, filterTo: r }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(t) {
    if (t.empty || this.isEmpty)
      return this;
    let e = [], i = [], s = -1;
    for (let o = 0; o < this.chunk.length; o++) {
      let l = this.chunkPos[o], a = this.chunk[o], c = t.touchesRange(l, l + a.length);
      if (c === !1)
        s = Math.max(s, a.maxPoint), e.push(a), i.push(t.mapPos(l));
      else if (c === !0) {
        let { mapped: h, pos: f } = a.map(l, t);
        h && (s = Math.max(s, h.maxPoint), e.push(h), i.push(f));
      }
    }
    let r = this.nextLayer.map(t);
    return e.length == 0 ? r : new H(i, e, r || H.empty, s);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(t, e, i) {
    if (!this.isEmpty) {
      for (let s = 0; s < this.chunk.length; s++) {
        let r = this.chunkPos[s], o = this.chunk[s];
        if (e >= r && t <= r + o.length && o.between(r, t - r, e - r, i) === !1)
          return;
      }
      this.nextLayer.between(t, e, i);
    }
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(t = 0) {
    return Si.from([this]).goto(t);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(t, e = 0) {
    return Si.from(t).goto(e);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(t, e, i, s, r = -1) {
    let o = t.filter((f) => f.maxPoint > 0 || !f.isEmpty && f.maxPoint >= r), l = e.filter((f) => f.maxPoint > 0 || !f.isEmpty && f.maxPoint >= r), a = fo(o, l, i), c = new oi(o, a, r), h = new oi(l, a, r);
    i.iterGaps((f, u, d) => uo(c, f, h, u, d, s)), i.empty && i.length == 0 && uo(c, 0, h, 0, 0, s);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(t, e, i = 0, s) {
    s == null && (s = 999999999);
    let r = t.filter((h) => !h.isEmpty && e.indexOf(h) < 0), o = e.filter((h) => !h.isEmpty && t.indexOf(h) < 0);
    if (r.length != o.length)
      return !1;
    if (!r.length)
      return !0;
    let l = fo(r, o), a = new oi(r, l, 0).goto(i), c = new oi(o, l, 0).goto(i);
    for (; ; ) {
      if (a.to != c.to || !zs(a.active, c.active) || a.point && (!c.point || !a.point.eq(c.point)))
        return !1;
      if (a.to > s)
        return !0;
      a.next(), c.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(t, e, i, s, r = -1) {
    let o = new oi(t, null, r).goto(e), l = e, a = o.openStart;
    for (; ; ) {
      let c = Math.min(o.to, i);
      if (o.point) {
        let h = o.activeForPoint(o.to), f = o.pointFrom < e ? h.length + 1 : o.point.startSide < 0 ? h.length : Math.min(h.length, a);
        s.point(l, c, o.point, h, f, o.pointRank), a = Math.min(o.openEnd(c), h.length);
      } else c > l && (s.span(l, c, o.active, a), a = o.openEnd(c));
      if (o.to > i)
        return a + (o.point && o.to > i ? 1 : 0);
      l = o.to, o.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(t, e = !1) {
    let i = new ge();
    for (let s of t instanceof Vs ? [t] : e ? Xc(t) : t)
      i.add(s.from, s.to, s.value);
    return i.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(t) {
    if (!t.length)
      return H.empty;
    let e = t[t.length - 1];
    for (let i = t.length - 2; i >= 0; i--)
      for (let s = t[i]; s != H.empty; s = s.nextLayer)
        e = new H(s.chunkPos, s.chunk, e, Math.max(s.maxPoint, e.maxPoint));
    return e;
  }
}
H.empty = /* @__PURE__ */ new H([], [], null, -1);
function Xc(n) {
  if (n.length > 1)
    for (let t = n[0], e = 1; e < n.length; e++) {
      let i = n[e];
      if (Ws(t, i) > 0)
        return n.slice().sort(Ws);
      t = i;
    }
  return n;
}
H.empty.nextLayer = H.empty;
class ge {
  finishChunk(t) {
    this.chunks.push(new Tr(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, t && (this.from = [], this.to = [], this.value = []);
  }
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(t, e, i) {
    this.addInner(t, e, i) || (this.nextLayer || (this.nextLayer = new ge())).add(t, e, i);
  }
  /**
  @internal
  */
  addInner(t, e, i) {
    let s = t - this.lastTo || i.startSide - this.last.endSide;
    if (s <= 0 && (t - this.lastFrom || i.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return s < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = t), this.from.push(t - this.chunkStart), this.to.push(e - this.chunkStart), this.last = i, this.lastFrom = t, this.lastTo = e, this.value.push(i), i.point && (this.maxPoint = Math.max(this.maxPoint, e - t)), !0);
  }
  /**
  @internal
  */
  addChunk(t, e) {
    if ((t - this.lastTo || e.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, e.maxPoint), this.chunks.push(e), this.chunkPos.push(t);
    let i = e.value.length - 1;
    return this.last = e.value[i], this.lastFrom = e.from[i] + t, this.lastTo = e.to[i] + t, !0;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(H.empty);
  }
  /**
  @internal
  */
  finishInner(t) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return t;
    let e = H.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(t) : t, this.setMaxPoint);
    return this.from = null, e;
  }
}
function fo(n, t, e) {
  let i = /* @__PURE__ */ new Map();
  for (let r of n)
    for (let o = 0; o < r.chunk.length; o++)
      r.chunk[o].maxPoint <= 0 && i.set(r.chunk[o], r.chunkPos[o]);
  let s = /* @__PURE__ */ new Set();
  for (let r of t)
    for (let o = 0; o < r.chunk.length; o++) {
      let l = i.get(r.chunk[o]);
      l != null && (e ? e.mapPos(l) : l) == r.chunkPos[o] && !(e != null && e.touchesRange(l, l + r.chunk[o].length)) && s.add(r.chunk[o]);
    }
  return s;
}
class la {
  constructor(t, e, i, s = 0) {
    this.layer = t, this.skip = e, this.minPoint = i, this.rank = s;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(t, e = -1e9) {
    return this.chunkIndex = this.rangeIndex = 0, this.gotoInner(t, e, !1), this;
  }
  gotoInner(t, e, i) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let s = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(s) || this.layer.chunkEnd(this.chunkIndex) < t || s.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, i = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let s = this.layer.chunk[this.chunkIndex].findIndex(t - this.layer.chunkPos[this.chunkIndex], e, !0);
      (!i || this.rangeIndex < s) && this.setRangeIndex(s);
    }
    this.next();
  }
  forward(t, e) {
    (this.to - t || this.endSide - e) < 0 && this.gotoInner(t, e, !0);
  }
  next() {
    for (; ; )
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9, this.value = null;
        break;
      } else {
        let t = this.layer.chunkPos[this.chunkIndex], e = this.layer.chunk[this.chunkIndex], i = t + e.from[this.rangeIndex];
        if (this.from = i, this.to = t + e.to[this.rangeIndex], this.value = e.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
  }
  setRangeIndex(t) {
    if (t == this.layer.chunk[this.chunkIndex].value.length) {
      if (this.chunkIndex++, this.skip)
        for (; this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]); )
          this.chunkIndex++;
      this.rangeIndex = 0;
    } else
      this.rangeIndex = t;
  }
  nextChunk() {
    this.chunkIndex++, this.rangeIndex = 0, this.next();
  }
  compare(t) {
    return this.from - t.from || this.startSide - t.startSide || this.rank - t.rank || this.to - t.to || this.endSide - t.endSide;
  }
}
class Si {
  constructor(t) {
    this.heap = t;
  }
  static from(t, e = null, i = -1) {
    let s = [];
    for (let r = 0; r < t.length; r++)
      for (let o = t[r]; !o.isEmpty; o = o.nextLayer)
        o.maxPoint >= i && s.push(new la(o, e, i, r));
    return s.length == 1 ? s[0] : new Si(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(t, e = -1e9) {
    for (let i of this.heap)
      i.goto(t, e);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      ls(this.heap, i);
    return this.next(), this;
  }
  forward(t, e) {
    for (let i of this.heap)
      i.forward(t, e);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      ls(this.heap, i);
    (this.to - t || this.value.endSide - e) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let t = this.heap[0];
      this.from = t.from, this.to = t.to, this.value = t.value, this.rank = t.rank, t.value && t.next(), ls(this.heap, 0);
    }
  }
}
function ls(n, t) {
  for (let e = n[t]; ; ) {
    let i = (t << 1) + 1;
    if (i >= n.length)
      break;
    let s = n[i];
    if (i + 1 < n.length && s.compare(n[i + 1]) >= 0 && (s = n[i + 1], i++), e.compare(s) < 0)
      break;
    n[i] = e, n[t] = s, t = i;
  }
}
class oi {
  constructor(t, e, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = Si.from(t, e, i);
  }
  goto(t, e = -1e9) {
    return this.cursor.goto(t, e), this.active.length = this.activeTo.length = this.activeRank.length = 0, this.minActive = -1, this.to = t, this.endSide = e, this.openStart = -1, this.next(), this;
  }
  forward(t, e) {
    for (; this.minActive > -1 && (this.activeTo[this.minActive] - t || this.active[this.minActive].endSide - e) < 0; )
      this.removeActive(this.minActive);
    this.cursor.forward(t, e);
  }
  removeActive(t) {
    Ui(this.active, t), Ui(this.activeTo, t), Ui(this.activeRank, t), this.minActive = po(this.active, this.activeTo);
  }
  addActive(t) {
    let e = 0, { value: i, to: s, rank: r } = this.cursor;
    for (; e < this.activeRank.length && (r - this.activeRank[e] || s - this.activeTo[e]) > 0; )
      e++;
    Gi(this.active, e, i), Gi(this.activeTo, e, s), Gi(this.activeRank, e, r), t && Gi(t, e, this.cursor.from), this.minActive = po(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let t = this.to, e = this.point;
    this.point = null;
    let i = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let s = this.minActive;
      if (s > -1 && (this.activeTo[s] - this.cursor.from || this.active[s].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[s] > t) {
          this.to = this.activeTo[s], this.endSide = this.active[s].endSide;
          break;
        }
        this.removeActive(s), i && Ui(i, s);
      } else if (this.cursor.value)
        if (this.cursor.from > t) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let r = this.cursor.value;
          if (!r.point)
            this.addActive(i), this.cursor.next();
          else if (e && this.cursor.to == this.to && this.cursor.from < this.cursor.to)
            this.cursor.next();
          else {
            this.point = r, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = r.endSide, this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (i) {
      this.openStart = 0;
      for (let s = i.length - 1; s >= 0 && i[s] < t; s--)
        this.openStart++;
    }
  }
  activeForPoint(t) {
    if (!this.active.length)
      return this.active;
    let e = [];
    for (let i = this.active.length - 1; i >= 0 && !(this.activeRank[i] < this.pointRank); i--)
      (this.activeTo[i] > t || this.activeTo[i] == t && this.active[i].endSide >= this.point.endSide) && e.push(this.active[i]);
    return e.reverse();
  }
  openEnd(t) {
    let e = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > t; i--)
      e++;
    return e;
  }
}
function uo(n, t, e, i, s, r) {
  n.goto(t), e.goto(i);
  let o = i + s, l = i, a = i - t;
  for (; ; ) {
    let c = n.to + a - e.to || n.endSide - e.endSide, h = c < 0 ? n.to + a : e.to, f = Math.min(h, o);
    if (n.point || e.point ? n.point && e.point && (n.point == e.point || n.point.eq(e.point)) && zs(n.activeForPoint(n.to), e.activeForPoint(e.to)) || r.comparePoint(l, f, n.point, e.point) : f > l && !zs(n.active, e.active) && r.compareRange(l, f, n.active, e.active), h > o)
      break;
    l = h, c <= 0 && n.next(), c >= 0 && e.next();
  }
}
function zs(n, t) {
  if (n.length != t.length)
    return !1;
  for (let e = 0; e < n.length; e++)
    if (n[e] != t[e] && !n[e].eq(t[e]))
      return !1;
  return !0;
}
function Ui(n, t) {
  for (let e = t, i = n.length - 1; e < i; e++)
    n[e] = n[e + 1];
  n.pop();
}
function Gi(n, t, e) {
  for (let i = n.length - 1; i >= t; i--)
    n[i + 1] = n[i];
  n[t] = e;
}
function po(n, t) {
  let e = -1, i = 1e9;
  for (let s = 0; s < t.length; s++)
    (t[s] - i || n[s].endSide - n[e].endSide) < 0 && (e = s, i = t[s]);
  return e;
}
function ii(n, t, e = n.length) {
  let i = 0;
  for (let s = 0; s < e; )
    n.charCodeAt(s) == 9 ? (i += t - i % t, s++) : (i++, s = lt(n, s));
  return i;
}
function qs(n, t, e, i) {
  for (let s = 0, r = 0; ; ) {
    if (r >= t)
      return s;
    if (s == n.length)
      break;
    r += n.charCodeAt(s) == 9 ? e - r % e : 1, s = lt(n, s);
  }
  return i === !0 ? -1 : n.length;
}
const $s = "ͼ", mo = typeof Symbol > "u" ? "__" + $s : Symbol.for($s), Ks = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet"), go = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class ye {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(t, e) {
    this.rules = [];
    let { finish: i } = e || {};
    function s(o) {
      return /^@/.test(o) ? [o] : o.split(/,\s*/);
    }
    function r(o, l, a, c) {
      let h = [], f = /^@(\w+)\b/.exec(o[0]), u = f && f[1] == "keyframes";
      if (f && l == null) return a.push(o[0] + ";");
      for (let d in l) {
        let p = l[d];
        if (/&/.test(d))
          r(
            d.split(/,\s*/).map((g) => o.map((y) => g.replace(/&/, y))).reduce((g, y) => g.concat(y)),
            p,
            a
          );
        else if (p && typeof p == "object") {
          if (!f) throw new RangeError("The value of a property (" + d + ") should be a primitive value.");
          r(s(d), p, h, u);
        } else p != null && h.push(d.replace(/_.*/, "").replace(/[A-Z]/g, (g) => "-" + g.toLowerCase()) + ": " + p + ";");
      }
      (h.length || u) && a.push((i && !f && !c ? o.map(i) : o).join(", ") + " {" + h.join(" ") + "}");
    }
    for (let o in t) r(s(o), t[o], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join(`
`);
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let t = go[mo] || 1;
    return go[mo] = t + 1, $s + t.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  //
  // If a Content Security Policy nonce is provided, it is added to
  // the `<style>` tag generated by the library.
  static mount(t, e, i) {
    let s = t[Ks], r = i && i.nonce;
    s ? r && s.setNonce(r) : s = new Qc(t, r), s.mount(Array.isArray(e) ? e : [e], t);
  }
}
let yo = /* @__PURE__ */ new Map();
class Qc {
  constructor(t, e) {
    let i = t.ownerDocument || t, s = i.defaultView;
    if (!t.head && t.adoptedStyleSheets && s.CSSStyleSheet) {
      let r = yo.get(i);
      if (r) return t[Ks] = r;
      this.sheet = new s.CSSStyleSheet(), yo.set(i, this);
    } else
      this.styleTag = i.createElement("style"), e && this.styleTag.setAttribute("nonce", e);
    this.modules = [], t[Ks] = this;
  }
  mount(t, e) {
    let i = this.sheet, s = 0, r = 0;
    for (let o = 0; o < t.length; o++) {
      let l = t[o], a = this.modules.indexOf(l);
      if (a < r && a > -1 && (this.modules.splice(a, 1), r--, a = -1), a == -1) {
        if (this.modules.splice(r++, 0, l), i) for (let c = 0; c < l.rules.length; c++)
          i.insertRule(l.rules[c], s++);
      } else {
        for (; r < a; ) s += this.modules[r++].rules.length;
        s += l.rules.length, r++;
      }
    }
    if (i)
      e.adoptedStyleSheets.indexOf(this.sheet) < 0 && (e.adoptedStyleSheets = [this.sheet, ...e.adoptedStyleSheets]);
    else {
      let o = "";
      for (let a = 0; a < this.modules.length; a++)
        o += this.modules[a].getRules() + `
`;
      this.styleTag.textContent = o;
      let l = e.head || e;
      this.styleTag.parentNode != l && l.insertBefore(this.styleTag, l.firstChild);
    }
  }
  setNonce(t) {
    this.styleTag && this.styleTag.getAttribute("nonce") != t && this.styleTag.setAttribute("nonce", t);
  }
}
var be = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, Ci = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, Zc = typeof navigator < "u" && /Mac/.test(navigator.platform), tf = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var rt = 0; rt < 10; rt++) be[48 + rt] = be[96 + rt] = String(rt);
for (var rt = 1; rt <= 24; rt++) be[rt + 111] = "F" + rt;
for (var rt = 65; rt <= 90; rt++)
  be[rt] = String.fromCharCode(rt + 32), Ci[rt] = String.fromCharCode(rt);
for (var as in be) Ci.hasOwnProperty(as) || (Ci[as] = be[as]);
function ef(n) {
  var t = Zc && n.metaKey && n.shiftKey && !n.ctrlKey && !n.altKey || tf && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", e = !t && n.key || (n.shiftKey ? Ci : be)[n.keyCode] || n.key || "Unidentified";
  return e == "Esc" && (e = "Escape"), e == "Del" && (e = "Delete"), e == "Left" && (e = "ArrowLeft"), e == "Up" && (e = "ArrowUp"), e == "Right" && (e = "ArrowRight"), e == "Down" && (e = "ArrowDown"), e;
}
function Ai(n) {
  let t;
  return n.nodeType == 11 ? t = n.getSelection ? n : n.ownerDocument : t = n, t.getSelection();
}
function js(n, t) {
  return t ? n == t || n.contains(t.nodeType != 1 ? t.parentNode : t) : !1;
}
function yn(n, t) {
  if (!t.anchorNode)
    return !1;
  try {
    return js(n, t.anchorNode);
  } catch {
    return !1;
  }
}
function Mi(n) {
  return n.nodeType == 3 ? Pe(n, 0, n.nodeValue.length).getClientRects() : n.nodeType == 1 ? n.getClientRects() : [];
}
function xi(n, t, e, i) {
  return e ? bo(n, t, e, i, -1) || bo(n, t, e, i, 1) : !1;
}
function Re(n) {
  for (var t = 0; ; t++)
    if (n = n.previousSibling, !n)
      return t;
}
function Mn(n) {
  return n.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(n.nodeName);
}
function bo(n, t, e, i, s) {
  for (; ; ) {
    if (n == e && t == i)
      return !0;
    if (t == (s < 0 ? 0 : Qt(n))) {
      if (n.nodeName == "DIV")
        return !1;
      let r = n.parentNode;
      if (!r || r.nodeType != 1)
        return !1;
      t = Re(n) + (s < 0 ? 0 : 1), n = r;
    } else if (n.nodeType == 1) {
      if (n = n.childNodes[t + (s < 0 ? -1 : 0)], n.nodeType == 1 && n.contentEditable == "false")
        return !1;
      t = s < 0 ? Qt(n) : 0;
    } else
      return !1;
  }
}
function Qt(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function Jn(n, t) {
  let e = t ? n.left : n.right;
  return { left: e, right: e, top: n.top, bottom: n.bottom };
}
function nf(n) {
  let t = n.visualViewport;
  return t ? {
    left: 0,
    right: t.width,
    top: 0,
    bottom: t.height
  } : {
    left: 0,
    right: n.innerWidth,
    top: 0,
    bottom: n.innerHeight
  };
}
function aa(n, t) {
  let e = t.width / n.offsetWidth, i = t.height / n.offsetHeight;
  return (e > 0.995 && e < 1.005 || !isFinite(e) || Math.abs(t.width - n.offsetWidth) < 1) && (e = 1), (i > 0.995 && i < 1.005 || !isFinite(i) || Math.abs(t.height - n.offsetHeight) < 1) && (i = 1), { scaleX: e, scaleY: i };
}
function sf(n, t, e, i, s, r, o, l) {
  let a = n.ownerDocument, c = a.defaultView || window;
  for (let h = n, f = !1; h && !f; )
    if (h.nodeType == 1) {
      let u, d = h == a.body, p = 1, g = 1;
      if (d)
        u = nf(c);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(h).position) && (f = !0), h.scrollHeight <= h.clientHeight && h.scrollWidth <= h.clientWidth) {
          h = h.assignedSlot || h.parentNode;
          continue;
        }
        let w = h.getBoundingClientRect();
        ({ scaleX: p, scaleY: g } = aa(h, w)), u = {
          left: w.left,
          right: w.left + h.clientWidth * p,
          top: w.top,
          bottom: w.top + h.clientHeight * g
        };
      }
      let y = 0, b = 0;
      if (s == "nearest")
        t.top < u.top ? (b = -(u.top - t.top + o), e > 0 && t.bottom > u.bottom + b && (b = t.bottom - u.bottom + b + o)) : t.bottom > u.bottom && (b = t.bottom - u.bottom + o, e < 0 && t.top - b < u.top && (b = -(u.top + b - t.top + o)));
      else {
        let w = t.bottom - t.top, k = u.bottom - u.top;
        b = (s == "center" && w <= k ? t.top + w / 2 - k / 2 : s == "start" || s == "center" && e < 0 ? t.top - o : t.bottom - k + o) - u.top;
      }
      if (i == "nearest" ? t.left < u.left ? (y = -(u.left - t.left + r), e > 0 && t.right > u.right + y && (y = t.right - u.right + y + r)) : t.right > u.right && (y = t.right - u.right + r, e < 0 && t.left < u.left + y && (y = -(u.left + y - t.left + r))) : y = (i == "center" ? t.left + (t.right - t.left) / 2 - (u.right - u.left) / 2 : i == "start" == l ? t.left - r : t.right - (u.right - u.left) + r) - u.left, y || b)
        if (d)
          c.scrollBy(y, b);
        else {
          let w = 0, k = 0;
          if (b) {
            let S = h.scrollTop;
            h.scrollTop += b / g, k = (h.scrollTop - S) * g;
          }
          if (y) {
            let S = h.scrollLeft;
            h.scrollLeft += y / p, w = (h.scrollLeft - S) * p;
          }
          t = {
            left: t.left - w,
            top: t.top - k,
            right: t.right - w,
            bottom: t.bottom - k
          }, w && Math.abs(w - y) < 1 && (i = "nearest"), k && Math.abs(k - b) < 1 && (s = "nearest");
        }
      if (d)
        break;
      h = h.assignedSlot || h.parentNode;
    } else if (h.nodeType == 11)
      h = h.host;
    else
      break;
}
function rf(n) {
  let t = n.ownerDocument, e, i;
  for (let s = n.parentNode; s && !(s == t.body || e && i); )
    if (s.nodeType == 1)
      !i && s.scrollHeight > s.clientHeight && (i = s), !e && s.scrollWidth > s.clientWidth && (e = s), s = s.assignedSlot || s.parentNode;
    else if (s.nodeType == 11)
      s = s.host;
    else
      break;
  return { x: e, y: i };
}
class of {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(t) {
    return this.anchorNode == t.anchorNode && this.anchorOffset == t.anchorOffset && this.focusNode == t.focusNode && this.focusOffset == t.focusOffset;
  }
  setRange(t) {
    let { anchorNode: e, focusNode: i } = t;
    this.set(e, Math.min(t.anchorOffset, e ? Qt(e) : 0), i, Math.min(t.focusOffset, i ? Qt(i) : 0));
  }
  set(t, e, i, s) {
    this.anchorNode = t, this.anchorOffset = e, this.focusNode = i, this.focusOffset = s;
  }
}
let He = null;
function ha(n) {
  if (n.setActive)
    return n.setActive();
  if (He)
    return n.focus(He);
  let t = [];
  for (let e = n; e && (t.push(e, e.scrollTop, e.scrollLeft), e != e.ownerDocument); e = e.parentNode)
    ;
  if (n.focus(He == null ? {
    get preventScroll() {
      return He = { preventScroll: !0 }, !0;
    }
  } : void 0), !He) {
    He = !1;
    for (let e = 0; e < t.length; ) {
      let i = t[e++], s = t[e++], r = t[e++];
      i.scrollTop != s && (i.scrollTop = s), i.scrollLeft != r && (i.scrollLeft = r);
    }
  }
}
let xo;
function Pe(n, t, e = t) {
  let i = xo || (xo = document.createRange());
  return i.setEnd(n, e), i.setStart(n, t), i;
}
function je(n, t, e, i) {
  let s = { key: t, code: t, keyCode: e, which: e, cancelable: !0 };
  i && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = i);
  let r = new KeyboardEvent("keydown", s);
  r.synthetic = !0, n.dispatchEvent(r);
  let o = new KeyboardEvent("keyup", s);
  return o.synthetic = !0, n.dispatchEvent(o), r.defaultPrevented || o.defaultPrevented;
}
function lf(n) {
  for (; n; ) {
    if (n && (n.nodeType == 9 || n.nodeType == 11 && n.host))
      return n;
    n = n.assignedSlot || n.parentNode;
  }
  return null;
}
function ca(n) {
  for (; n.attributes.length; )
    n.removeAttributeNode(n.attributes[0]);
}
function af(n, t) {
  let e = t.focusNode, i = t.focusOffset;
  if (!e || t.anchorNode != e || t.anchorOffset != i)
    return !1;
  for (i = Math.min(i, Qt(e)); ; )
    if (i) {
      if (e.nodeType != 1)
        return !1;
      let s = e.childNodes[i - 1];
      s.contentEditable == "false" ? i-- : (e = s, i = Qt(e));
    } else {
      if (e == n)
        return !0;
      i = Re(e), e = e.parentNode;
    }
}
function fa(n) {
  return n.scrollTop > Math.max(1, n.scrollHeight - n.clientHeight - 4);
}
function ua(n, t) {
  for (let e = n, i = t; ; ) {
    if (e.nodeType == 3 && i > 0)
      return { node: e, offset: i };
    if (e.nodeType == 1 && i > 0) {
      if (e.contentEditable == "false")
        return null;
      e = e.childNodes[i - 1], i = Qt(e);
    } else if (e.parentNode && !Mn(e))
      i = Re(e), e = e.parentNode;
    else
      return null;
  }
}
function da(n, t) {
  for (let e = n, i = t; ; ) {
    if (e.nodeType == 3 && i < e.nodeValue.length)
      return { node: e, offset: i };
    if (e.nodeType == 1 && i < e.childNodes.length) {
      if (e.contentEditable == "false")
        return null;
      e = e.childNodes[i], i = 0;
    } else if (e.parentNode && !Mn(e))
      i = Re(e) + 1, e = e.parentNode;
    else
      return null;
  }
}
class ct {
  constructor(t, e, i = !0) {
    this.node = t, this.offset = e, this.precise = i;
  }
  static before(t, e) {
    return new ct(t.parentNode, Re(t), e);
  }
  static after(t, e) {
    return new ct(t.parentNode, Re(t) + 1, e);
  }
}
const Br = [];
class K {
  constructor() {
    this.parent = null, this.dom = null, this.flags = 2;
  }
  get overrideDOMText() {
    return null;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(t) {
    let e = this.posAtStart;
    for (let i of this.children) {
      if (i == t)
        return e;
      e += i.length + i.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(t) {
    return this.posBefore(t) + t.length;
  }
  sync(t, e) {
    if (this.flags & 2) {
      let i = this.dom, s = null, r;
      for (let o of this.children) {
        if (o.flags & 7) {
          if (!o.dom && (r = s ? s.nextSibling : i.firstChild)) {
            let l = K.get(r);
            (!l || !l.parent && l.canReuseDOM(o)) && o.reuseDOM(r);
          }
          o.sync(t, e), o.flags &= -8;
        }
        if (r = s ? s.nextSibling : i.firstChild, e && !e.written && e.node == i && r != o.dom && (e.written = !0), o.dom.parentNode == i)
          for (; r && r != o.dom; )
            r = wo(r);
        else
          i.insertBefore(o.dom, r);
        s = o.dom;
      }
      for (r = s ? s.nextSibling : i.firstChild, r && e && e.node == i && (e.written = !0); r; )
        r = wo(r);
    } else if (this.flags & 1)
      for (let i of this.children)
        i.flags & 7 && (i.sync(t, e), i.flags &= -8);
  }
  reuseDOM(t) {
  }
  localPosFromDOM(t, e) {
    let i;
    if (t == this.dom)
      i = this.dom.childNodes[e];
    else {
      let s = Qt(t) == 0 ? 0 : e == 0 ? -1 : 1;
      for (; ; ) {
        let r = t.parentNode;
        if (r == this.dom)
          break;
        s == 0 && r.firstChild != r.lastChild && (t == r.firstChild ? s = -1 : s = 1), t = r;
      }
      s < 0 ? i = t : i = t.nextSibling;
    }
    if (i == this.dom.firstChild)
      return 0;
    for (; i && !K.get(i); )
      i = i.nextSibling;
    if (!i)
      return this.length;
    for (let s = 0, r = 0; ; s++) {
      let o = this.children[s];
      if (o.dom == i)
        return r;
      r += o.length + o.breakAfter;
    }
  }
  domBoundsAround(t, e, i = 0) {
    let s = -1, r = -1, o = -1, l = -1;
    for (let a = 0, c = i, h = i; a < this.children.length; a++) {
      let f = this.children[a], u = c + f.length;
      if (c < t && u > e)
        return f.domBoundsAround(t, e, c);
      if (u >= t && s == -1 && (s = a, r = c), c > e && f.dom.parentNode == this.dom) {
        o = a, l = h;
        break;
      }
      h = u, c = u + f.breakAfter;
    }
    return {
      from: r,
      to: l < 0 ? i + this.length : l,
      startDOM: (s ? this.children[s - 1].dom.nextSibling : null) || this.dom.firstChild,
      endDOM: o < this.children.length && o >= 0 ? this.children[o].dom : null
    };
  }
  markDirty(t = !1) {
    this.flags |= 2, this.markParentsDirty(t);
  }
  markParentsDirty(t) {
    for (let e = this.parent; e; e = e.parent) {
      if (t && (e.flags |= 2), e.flags & 1)
        return;
      e.flags |= 1, t = !1;
    }
  }
  setParent(t) {
    this.parent != t && (this.parent = t, this.flags & 7 && this.markParentsDirty(!0));
  }
  setDOM(t) {
    this.dom != t && (this.dom && (this.dom.cmView = null), this.dom = t, t.cmView = this);
  }
  get rootView() {
    for (let t = this; ; ) {
      let e = t.parent;
      if (!e)
        return t;
      t = e;
    }
  }
  replaceChildren(t, e, i = Br) {
    this.markDirty();
    for (let s = t; s < e; s++) {
      let r = this.children[s];
      r.parent == this && i.indexOf(r) < 0 && r.destroy();
    }
    i.length < 250 ? this.children.splice(t, e - t, ...i) : this.children = [].concat(this.children.slice(0, t), i, this.children.slice(e));
    for (let s = 0; s < i.length; s++)
      i[s].setParent(this);
  }
  ignoreMutation(t) {
    return !1;
  }
  ignoreEvent(t) {
    return !1;
  }
  childCursor(t = this.length) {
    return new pa(this.children, t, this.children.length);
  }
  childPos(t, e = 1) {
    return this.childCursor().findPos(t, e);
  }
  toString() {
    let t = this.constructor.name.replace("View", "");
    return t + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (t == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
  }
  static get(t) {
    return t.cmView;
  }
  get isEditable() {
    return !0;
  }
  get isWidget() {
    return !1;
  }
  get isHidden() {
    return !1;
  }
  merge(t, e, i, s, r, o) {
    return !1;
  }
  become(t) {
    return !1;
  }
  canReuseDOM(t) {
    return t.constructor == this.constructor && !((this.flags | t.flags) & 8);
  }
  // When this is a zero-length view with a side, this should return a
  // number <= 0 to indicate it is before its position, or a
  // number > 0 when after its position.
  getSide() {
    return 0;
  }
  destroy() {
    for (let t of this.children)
      t.parent == this && t.destroy();
    this.parent = null;
  }
}
K.prototype.breakAfter = 0;
function wo(n) {
  let t = n.nextSibling;
  return n.parentNode.removeChild(n), t;
}
class pa {
  constructor(t, e, i) {
    this.children = t, this.pos = e, this.i = i, this.off = 0;
  }
  findPos(t, e = 1) {
    for (; ; ) {
      if (t > this.pos || t == this.pos && (e > 0 || this.i == 0 || this.children[this.i - 1].breakAfter))
        return this.off = t - this.pos, this;
      let i = this.children[--this.i];
      this.pos -= i.length + i.breakAfter;
    }
  }
}
function ma(n, t, e, i, s, r, o, l, a) {
  let { children: c } = n, h = c.length ? c[t] : null, f = r.length ? r[r.length - 1] : null, u = f ? f.breakAfter : o;
  if (!(t == i && h && !o && !u && r.length < 2 && h.merge(e, s, r.length ? f : null, e == 0, l, a))) {
    if (i < c.length) {
      let d = c[i];
      d && (s < d.length || d.breakAfter && (f != null && f.breakAfter)) ? (t == i && (d = d.split(s), s = 0), !u && f && d.merge(0, s, f, !0, 0, a) ? r[r.length - 1] = d : ((s || d.children.length && !d.children[0].length) && d.merge(0, s, null, !1, 0, a), r.push(d))) : d != null && d.breakAfter && (f ? f.breakAfter = 1 : o = 1), i++;
    }
    for (h && (h.breakAfter = o, e > 0 && (!o && r.length && h.merge(e, h.length, r[0], !1, l, 0) ? h.breakAfter = r.shift().breakAfter : (e < h.length || h.children.length && h.children[h.children.length - 1].length == 0) && h.merge(e, h.length, null, !1, l, 0), t++)); t < i && r.length; )
      if (c[i - 1].become(r[r.length - 1]))
        i--, r.pop(), a = r.length ? 0 : l;
      else if (c[t].become(r[0]))
        t++, r.shift(), l = r.length ? 0 : a;
      else
        break;
    !r.length && t && i < c.length && !c[t - 1].breakAfter && c[i].merge(0, 0, c[t - 1], !1, l, a) && t--, (t < i || r.length) && n.replaceChildren(t, i, r);
  }
}
function ga(n, t, e, i, s, r) {
  let o = n.childCursor(), { i: l, off: a } = o.findPos(e, 1), { i: c, off: h } = o.findPos(t, -1), f = t - e;
  for (let u of i)
    f += u.length;
  n.length += f, ma(n, c, h, l, a, i, 0, s, r);
}
let bt = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Us = typeof document < "u" ? document : { documentElement: { style: {} } };
const Gs = /* @__PURE__ */ /Edge\/(\d+)/.exec(bt.userAgent), ya = /* @__PURE__ */ /MSIE \d/.test(bt.userAgent), Ys = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(bt.userAgent), Xn = !!(ya || Ys || Gs), vo = !Xn && /* @__PURE__ */ /gecko\/(\d+)/i.test(bt.userAgent), hs = !Xn && /* @__PURE__ */ /Chrome\/(\d+)/.exec(bt.userAgent), ko = "webkitFontSmoothing" in Us.documentElement.style, ba = !Xn && /* @__PURE__ */ /Apple Computer/.test(bt.vendor), So = ba && (/* @__PURE__ */ /Mobile\/\w+/.test(bt.userAgent) || bt.maxTouchPoints > 2);
var T = {
  mac: So || /* @__PURE__ */ /Mac/.test(bt.platform),
  windows: /* @__PURE__ */ /Win/.test(bt.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(bt.platform),
  ie: Xn,
  ie_version: ya ? Us.documentMode || 6 : Ys ? +Ys[1] : Gs ? +Gs[1] : 0,
  gecko: vo,
  gecko_version: vo ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(bt.userAgent) || [0, 0])[1] : 0,
  chrome: !!hs,
  chrome_version: hs ? +hs[1] : 0,
  ios: So,
  android: /* @__PURE__ */ /Android\b/.test(bt.userAgent),
  webkit: ko,
  safari: ba,
  webkit_version: ko ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(bt.userAgent) || [0, 0])[1] : 0,
  tabSize: Us.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
const hf = 256;
class Ft extends K {
  constructor(t) {
    super(), this.text = t;
  }
  get length() {
    return this.text.length;
  }
  createDOM(t) {
    this.setDOM(t || document.createTextNode(this.text));
  }
  sync(t, e) {
    this.dom || this.createDOM(), this.dom.nodeValue != this.text && (e && e.node == this.dom && (e.written = !0), this.dom.nodeValue = this.text);
  }
  reuseDOM(t) {
    t.nodeType == 3 && this.createDOM(t);
  }
  merge(t, e, i) {
    return this.flags & 8 || i && (!(i instanceof Ft) || this.length - (e - t) + i.length > hf || i.flags & 8) ? !1 : (this.text = this.text.slice(0, t) + (i ? i.text : "") + this.text.slice(e), this.markDirty(), !0);
  }
  split(t) {
    let e = new Ft(this.text.slice(t));
    return this.text = this.text.slice(0, t), this.markDirty(), e.flags |= this.flags & 8, e;
  }
  localPosFromDOM(t, e) {
    return t == this.dom ? e : e ? this.text.length : 0;
  }
  domAtPos(t) {
    return new ct(this.dom, t);
  }
  domBoundsAround(t, e, i) {
    return { from: i, to: i + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
  }
  coordsAt(t, e) {
    return cf(this.dom, t, e);
  }
}
class ne extends K {
  constructor(t, e = [], i = 0) {
    super(), this.mark = t, this.children = e, this.length = i;
    for (let s of e)
      s.setParent(this);
  }
  setAttrs(t) {
    if (ca(t), this.mark.class && (t.className = this.mark.class), this.mark.attrs)
      for (let e in this.mark.attrs)
        t.setAttribute(e, this.mark.attrs[e]);
    return t;
  }
  canReuseDOM(t) {
    return super.canReuseDOM(t) && !((this.flags | t.flags) & 8);
  }
  reuseDOM(t) {
    t.nodeName == this.mark.tagName.toUpperCase() && (this.setDOM(t), this.flags |= 6);
  }
  sync(t, e) {
    this.dom ? this.flags & 4 && this.setAttrs(this.dom) : this.setDOM(this.setAttrs(document.createElement(this.mark.tagName))), super.sync(t, e);
  }
  merge(t, e, i, s, r, o) {
    return i && (!(i instanceof ne && i.mark.eq(this.mark)) || t && r <= 0 || e < this.length && o <= 0) ? !1 : (ga(this, t, e, i ? i.children.slice() : [], r - 1, o - 1), this.markDirty(), !0);
  }
  split(t) {
    let e = [], i = 0, s = -1, r = 0;
    for (let l of this.children) {
      let a = i + l.length;
      a > t && e.push(i < t ? l.split(t - i) : l), s < 0 && i >= t && (s = r), i = a, r++;
    }
    let o = this.length - t;
    return this.length = t, s > -1 && (this.children.length = s, this.markDirty()), new ne(this.mark, e, o);
  }
  domAtPos(t) {
    return xa(this, t);
  }
  coordsAt(t, e) {
    return va(this, t, e);
  }
}
function cf(n, t, e) {
  let i = n.nodeValue.length;
  t > i && (t = i);
  let s = t, r = t, o = 0;
  t == 0 && e < 0 || t == i && e >= 0 ? T.chrome || T.gecko || (t ? (s--, o = 1) : r < i && (r++, o = -1)) : e < 0 ? s-- : r < i && r++;
  let l = Pe(n, s, r).getClientRects();
  if (!l.length)
    return null;
  let a = l[(o ? o < 0 : e >= 0) ? 0 : l.length - 1];
  return T.safari && !o && a.width == 0 && (a = Array.prototype.find.call(l, (c) => c.width) || a), o ? Jn(a, o < 0) : a || null;
}
class fe extends K {
  static create(t, e, i) {
    return new fe(t, e, i);
  }
  constructor(t, e, i) {
    super(), this.widget = t, this.length = e, this.side = i, this.prevWidget = null;
  }
  split(t) {
    let e = fe.create(this.widget, this.length - t, this.side);
    return this.length -= t, e;
  }
  sync(t) {
    (!this.dom || !this.widget.updateDOM(this.dom, t)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(t)), this.widget.editable || (this.dom.contentEditable = "false"));
  }
  getSide() {
    return this.side;
  }
  merge(t, e, i, s, r, o) {
    return i && (!(i instanceof fe) || !this.widget.compare(i.widget) || t > 0 && r <= 0 || e < this.length && o <= 0) ? !1 : (this.length = t + (i ? i.length : 0) + (this.length - e), !0);
  }
  become(t) {
    return t instanceof fe && t.side == this.side && this.widget.constructor == t.widget.constructor ? (this.widget.compare(t.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = t.widget, this.length = t.length, !0) : !1;
  }
  ignoreMutation() {
    return !0;
  }
  ignoreEvent(t) {
    return this.widget.ignoreEvent(t);
  }
  get overrideDOMText() {
    if (this.length == 0)
      return V.empty;
    let t = this;
    for (; t.parent; )
      t = t.parent;
    let { view: e } = t, i = e && e.state.doc, s = this.posAtStart;
    return i ? i.slice(s, s + this.length) : V.empty;
  }
  domAtPos(t) {
    return (this.length ? t == 0 : this.side > 0) ? ct.before(this.dom) : ct.after(this.dom, t == this.length);
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(t, e) {
    let i = this.widget.coordsAt(this.dom, t, e);
    if (i)
      return i;
    let s = this.dom.getClientRects(), r = null;
    if (!s.length)
      return null;
    let o = this.side ? this.side < 0 : t > 0;
    for (let l = o ? s.length - 1 : 0; r = s[l], !(t > 0 ? l == 0 : l == s.length - 1 || r.top < r.bottom); l += o ? -1 : 1)
      ;
    return Jn(r, !o);
  }
  get isEditable() {
    return !1;
  }
  get isWidget() {
    return !0;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  destroy() {
    super.destroy(), this.dom && this.widget.destroy(this.dom);
  }
}
class Je extends K {
  constructor(t) {
    super(), this.side = t;
  }
  get length() {
    return 0;
  }
  merge() {
    return !1;
  }
  become(t) {
    return t instanceof Je && t.side == this.side;
  }
  split() {
    return new Je(this.side);
  }
  sync() {
    if (!this.dom) {
      let t = document.createElement("img");
      t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), this.setDOM(t);
    }
  }
  getSide() {
    return this.side;
  }
  domAtPos(t) {
    return this.side > 0 ? ct.before(this.dom) : ct.after(this.dom);
  }
  localPosFromDOM() {
    return 0;
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(t) {
    return this.dom.getBoundingClientRect();
  }
  get overrideDOMText() {
    return V.empty;
  }
  get isHidden() {
    return !0;
  }
}
Ft.prototype.children = fe.prototype.children = Je.prototype.children = Br;
function xa(n, t) {
  let e = n.dom, { children: i } = n, s = 0;
  for (let r = 0; s < i.length; s++) {
    let o = i[s], l = r + o.length;
    if (!(l == r && o.getSide() <= 0)) {
      if (t > r && t < l && o.dom.parentNode == e)
        return o.domAtPos(t - r);
      if (t <= r)
        break;
      r = l;
    }
  }
  for (let r = s; r > 0; r--) {
    let o = i[r - 1];
    if (o.dom.parentNode == e)
      return o.domAtPos(o.length);
  }
  for (let r = s; r < i.length; r++) {
    let o = i[r];
    if (o.dom.parentNode == e)
      return o.domAtPos(0);
  }
  return new ct(e, 0);
}
function wa(n, t, e) {
  let i, { children: s } = n;
  e > 0 && t instanceof ne && s.length && (i = s[s.length - 1]) instanceof ne && i.mark.eq(t.mark) ? wa(i, t.children[0], e - 1) : (s.push(t), t.setParent(n)), n.length += t.length;
}
function va(n, t, e) {
  let i = null, s = -1, r = null, o = -1;
  function l(c, h) {
    for (let f = 0, u = 0; f < c.children.length && u <= h; f++) {
      let d = c.children[f], p = u + d.length;
      p >= h && (d.children.length ? l(d, h - u) : (!r || r.isHidden && e > 0) && (p > h || u == p && d.getSide() > 0) ? (r = d, o = h - u) : (u < h || u == p && d.getSide() < 0 && !d.isHidden) && (i = d, s = h - u)), u = p;
    }
  }
  l(n, t);
  let a = (e < 0 ? i : r) || i || r;
  return a ? a.coordsAt(Math.max(0, a == i ? s : o), e) : ff(n);
}
function ff(n) {
  let t = n.dom.lastChild;
  if (!t)
    return n.dom.getBoundingClientRect();
  let e = Mi(t);
  return e[e.length - 1] || null;
}
function _s(n, t) {
  for (let e in n)
    e == "class" && t.class ? t.class += " " + n.class : e == "style" && t.style ? t.style += ";" + n.style : t[e] = n[e];
  return t;
}
const Co = /* @__PURE__ */ Object.create(null);
function Dn(n, t, e) {
  if (n == t)
    return !0;
  n || (n = Co), t || (t = Co);
  let i = Object.keys(n), s = Object.keys(t);
  if (i.length - (e && i.indexOf(e) > -1 ? 1 : 0) != s.length - (e && s.indexOf(e) > -1 ? 1 : 0))
    return !1;
  for (let r of i)
    if (r != e && (s.indexOf(r) == -1 || n[r] !== t[r]))
      return !1;
  return !0;
}
function Js(n, t, e) {
  let i = !1;
  if (t)
    for (let s in t)
      e && s in e || (i = !0, s == "style" ? n.style.cssText = "" : n.removeAttribute(s));
  if (e)
    for (let s in e)
      t && t[s] == e[s] || (i = !0, s == "style" ? n.style.cssText = e[s] : n.setAttribute(s, e[s]));
  return i;
}
function uf(n) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let e = 0; e < n.attributes.length; e++) {
    let i = n.attributes[e];
    t[i.name] = i.value;
  }
  return t;
}
class ke {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(t) {
    return !1;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(t, e) {
    return !1;
  }
  /**
  @internal
  */
  compare(t) {
    return this == t || this.constructor == t.constructor && this.eq(t);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  For inline widgets that are displayed inline (as opposed to
  `inline-block`) and introduce line breaks (through `<br>` tags
  or textual newlines), this must indicate the amount of line
  breaks they introduce. Defaults to 0.
  */
  get lineBreaks() {
    return 0;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(t) {
    return !0;
  }
  /**
  Override the way screen coordinates for positions at/in the
  widget are found. `pos` will be the offset into the widget, and
  `side` the side of the position that is being queried—less than
  zero for before, greater than zero for after, and zero for
  directly at that position.
  */
  coordsAt(t, e, i) {
    return null;
  }
  /**
  @internal
  */
  get isHidden() {
    return !1;
  }
  /**
  @internal
  */
  get editable() {
    return !1;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(t) {
  }
}
var gt = /* @__PURE__ */ function(n) {
  return n[n.Text = 0] = "Text", n[n.WidgetBefore = 1] = "WidgetBefore", n[n.WidgetAfter = 2] = "WidgetAfter", n[n.WidgetRange = 3] = "WidgetRange", n;
}(gt || (gt = {}));
class B extends Le {
  constructor(t, e, i, s) {
    super(), this.startSide = t, this.endSide = e, this.widget = i, this.spec = s;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return !1;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(t) {
    return new Hi(t);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(t) {
    let e = Math.max(-1e4, Math.min(1e4, t.side || 0)), i = !!t.block;
    return e += i && !t.inlineOrder ? e > 0 ? 3e8 : -4e8 : e > 0 ? 1e8 : -1e8, new xe(t, e, e, i, t.widget || null, !1);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(t) {
    let e = !!t.block, i, s;
    if (t.isBlockGap)
      i = -5e8, s = 4e8;
    else {
      let { start: r, end: o } = ka(t, e);
      i = (r ? e ? -3e8 : -1 : 5e8) - 1, s = (o ? e ? 2e8 : 1 : -6e8) + 1;
    }
    return new xe(t, i, s, e, t.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(t) {
    return new Vi(t);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(t, e = !1) {
    return H.of(t, e);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
B.none = H.empty;
class Hi extends B {
  constructor(t) {
    let { start: e, end: i } = ka(t);
    super(e ? -1 : 5e8, i ? 1 : -6e8, null, t), this.tagName = t.tagName || "span", this.class = t.class || "", this.attrs = t.attributes || null;
  }
  eq(t) {
    var e, i;
    return this == t || t instanceof Hi && this.tagName == t.tagName && (this.class || ((e = this.attrs) === null || e === void 0 ? void 0 : e.class)) == (t.class || ((i = t.attrs) === null || i === void 0 ? void 0 : i.class)) && Dn(this.attrs, t.attrs, "class");
  }
  range(t, e = t) {
    if (t >= e)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(t, e);
  }
}
Hi.prototype.point = !1;
class Vi extends B {
  constructor(t) {
    super(-2e8, -2e8, null, t);
  }
  eq(t) {
    return t instanceof Vi && this.spec.class == t.spec.class && Dn(this.spec.attributes, t.spec.attributes);
  }
  range(t, e = t) {
    if (e != t)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(t, e);
  }
}
Vi.prototype.mapMode = mt.TrackBefore;
Vi.prototype.point = !0;
class xe extends B {
  constructor(t, e, i, s, r, o) {
    super(e, i, r, t), this.block = s, this.isReplace = o, this.mapMode = s ? e <= 0 ? mt.TrackBefore : mt.TrackAfter : mt.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? gt.WidgetRange : this.startSide <= 0 ? gt.WidgetBefore : gt.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(t) {
    return t instanceof xe && df(this.widget, t.widget) && this.block == t.block && this.startSide == t.startSide && this.endSide == t.endSide;
  }
  range(t, e = t) {
    if (this.isReplace && (t > e || t == e && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && e != t)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(t, e);
  }
}
xe.prototype.point = !0;
function ka(n, t = !1) {
  let { inclusiveStart: e, inclusiveEnd: i } = n;
  return e == null && (e = n.inclusive), i == null && (i = n.inclusive), { start: e ?? t, end: i ?? t };
}
function df(n, t) {
  return n == t || !!(n && t && n.compare(t));
}
function Xs(n, t, e, i = 0) {
  let s = e.length - 1;
  s >= 0 && e[s] + i >= n ? e[s] = Math.max(e[s], t) : e.push(n, t);
}
class X extends K {
  constructor() {
    super(...arguments), this.children = [], this.length = 0, this.prevAttrs = void 0, this.attrs = null, this.breakAfter = 0;
  }
  // Consumes source
  merge(t, e, i, s, r, o) {
    if (i) {
      if (!(i instanceof X))
        return !1;
      this.dom || i.transferDOM(this);
    }
    return s && this.setDeco(i ? i.attrs : null), ga(this, t, e, i ? i.children.slice() : [], r, o), !0;
  }
  split(t) {
    let e = new X();
    if (e.breakAfter = this.breakAfter, this.length == 0)
      return e;
    let { i, off: s } = this.childPos(t);
    s && (e.append(this.children[i].split(s), 0), this.children[i].merge(s, this.children[i].length, null, !1, 0, 0), i++);
    for (let r = i; r < this.children.length; r++)
      e.append(this.children[r], 0);
    for (; i > 0 && this.children[i - 1].length == 0; )
      this.children[--i].destroy();
    return this.children.length = i, this.markDirty(), this.length = t, e;
  }
  transferDOM(t) {
    this.dom && (this.markDirty(), t.setDOM(this.dom), t.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs, this.prevAttrs = void 0, this.dom = null);
  }
  setDeco(t) {
    Dn(this.attrs, t) || (this.dom && (this.prevAttrs = this.attrs, this.markDirty()), this.attrs = t);
  }
  append(t, e) {
    wa(this, t, e);
  }
  // Only called when building a line view in ContentBuilder
  addLineDeco(t) {
    let e = t.spec.attributes, i = t.spec.class;
    e && (this.attrs = _s(e, this.attrs || {})), i && (this.attrs = _s({ class: i }, this.attrs || {}));
  }
  domAtPos(t) {
    return xa(this, t);
  }
  reuseDOM(t) {
    t.nodeName == "DIV" && (this.setDOM(t), this.flags |= 6);
  }
  sync(t, e) {
    var i;
    this.dom ? this.flags & 4 && (ca(this.dom), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0) : (this.setDOM(document.createElement("div")), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0), this.prevAttrs !== void 0 && (Js(this.dom, this.prevAttrs, this.attrs), this.dom.classList.add("cm-line"), this.prevAttrs = void 0), super.sync(t, e);
    let s = this.dom.lastChild;
    for (; s && K.get(s) instanceof ne; )
      s = s.lastChild;
    if (!s || !this.length || s.nodeName != "BR" && ((i = K.get(s)) === null || i === void 0 ? void 0 : i.isEditable) == !1 && (!T.ios || !this.children.some((r) => r instanceof Ft))) {
      let r = document.createElement("BR");
      r.cmIgnore = !0, this.dom.appendChild(r);
    }
  }
  measureTextSize() {
    if (this.children.length == 0 || this.length > 20)
      return null;
    let t = 0, e;
    for (let i of this.children) {
      if (!(i instanceof Ft) || /[^ -~]/.test(i.text))
        return null;
      let s = Mi(i.dom);
      if (s.length != 1)
        return null;
      t += s[0].width, e = s[0].height;
    }
    return t ? {
      lineHeight: this.dom.getBoundingClientRect().height,
      charWidth: t / this.length,
      textHeight: e
    } : null;
  }
  coordsAt(t, e) {
    let i = va(this, t, e);
    if (!this.children.length && i && this.parent) {
      let { heightOracle: s } = this.parent.view.viewState, r = i.bottom - i.top;
      if (Math.abs(r - s.lineHeight) < 2 && s.textHeight < r) {
        let o = (r - s.textHeight) / 2;
        return { top: i.top + o, bottom: i.bottom - o, left: i.left, right: i.left };
      }
    }
    return i;
  }
  become(t) {
    return t instanceof X && this.children.length == 0 && t.children.length == 0 && Dn(this.attrs, t.attrs) && this.breakAfter == t.breakAfter;
  }
  covers() {
    return !0;
  }
  static find(t, e) {
    for (let i = 0, s = 0; i < t.children.length; i++) {
      let r = t.children[i], o = s + r.length;
      if (o >= e) {
        if (r instanceof X)
          return r;
        if (o > e)
          break;
      }
      s = o + r.breakAfter;
    }
    return null;
  }
}
class ie extends K {
  constructor(t, e, i) {
    super(), this.widget = t, this.length = e, this.deco = i, this.breakAfter = 0, this.prevWidget = null;
  }
  merge(t, e, i, s, r, o) {
    return i && (!(i instanceof ie) || !this.widget.compare(i.widget) || t > 0 && r <= 0 || e < this.length && o <= 0) ? !1 : (this.length = t + (i ? i.length : 0) + (this.length - e), !0);
  }
  domAtPos(t) {
    return t == 0 ? ct.before(this.dom) : ct.after(this.dom, t == this.length);
  }
  split(t) {
    let e = this.length - t;
    this.length = t;
    let i = new ie(this.widget, e, this.deco);
    return i.breakAfter = this.breakAfter, i;
  }
  get children() {
    return Br;
  }
  sync(t) {
    (!this.dom || !this.widget.updateDOM(this.dom, t)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(t)), this.widget.editable || (this.dom.contentEditable = "false"));
  }
  get overrideDOMText() {
    return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : V.empty;
  }
  domBoundsAround() {
    return null;
  }
  become(t) {
    return t instanceof ie && t.widget.constructor == this.widget.constructor ? (t.widget.compare(this.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = t.widget, this.length = t.length, this.deco = t.deco, this.breakAfter = t.breakAfter, !0) : !1;
  }
  ignoreMutation() {
    return !0;
  }
  ignoreEvent(t) {
    return this.widget.ignoreEvent(t);
  }
  get isEditable() {
    return !1;
  }
  get isWidget() {
    return !0;
  }
  coordsAt(t, e) {
    let i = this.widget.coordsAt(this.dom, t, e);
    return i || (this.widget instanceof Qs ? null : Jn(this.dom.getBoundingClientRect(), this.length ? t == 0 : e <= 0));
  }
  destroy() {
    super.destroy(), this.dom && this.widget.destroy(this.dom);
  }
  covers(t) {
    let { startSide: e, endSide: i } = this.deco;
    return e == i ? !1 : t < 0 ? e < 0 : i > 0;
  }
}
class Qs extends ke {
  constructor(t) {
    super(), this.height = t;
  }
  toDOM() {
    let t = document.createElement("div");
    return t.className = "cm-gap", this.updateDOM(t), t;
  }
  eq(t) {
    return t.height == this.height;
  }
  updateDOM(t) {
    return t.style.height = this.height + "px", !0;
  }
  get editable() {
    return !0;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return !1;
  }
}
class wi {
  constructor(t, e, i, s) {
    this.doc = t, this.pos = e, this.end = i, this.disallowBlockEffectsFor = s, this.content = [], this.curLine = null, this.breakAtStart = 0, this.pendingBuffer = 0, this.bufferMarks = [], this.atCursorPos = !0, this.openStart = -1, this.openEnd = -1, this.text = "", this.textOff = 0, this.cursor = t.iter(), this.skip = e;
  }
  posCovered() {
    if (this.content.length == 0)
      return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
    let t = this.content[this.content.length - 1];
    return !(t.breakAfter || t instanceof ie && t.deco.endSide < 0);
  }
  getLine() {
    return this.curLine || (this.content.push(this.curLine = new X()), this.atCursorPos = !0), this.curLine;
  }
  flushBuffer(t = this.bufferMarks) {
    this.pendingBuffer && (this.curLine.append(Yi(new Je(-1), t), t.length), this.pendingBuffer = 0);
  }
  addBlockWidget(t) {
    this.flushBuffer(), this.curLine = null, this.content.push(t);
  }
  finish(t) {
    this.pendingBuffer && t <= this.bufferMarks.length ? this.flushBuffer() : this.pendingBuffer = 0, !this.posCovered() && !(t && this.content.length && this.content[this.content.length - 1] instanceof ie) && this.getLine();
  }
  buildText(t, e, i) {
    for (; t > 0; ) {
      if (this.textOff == this.text.length) {
        let { value: r, lineBreak: o, done: l } = this.cursor.next(this.skip);
        if (this.skip = 0, l)
          throw new Error("Ran out of text content when drawing inline views");
        if (o) {
          this.posCovered() || this.getLine(), this.content.length ? this.content[this.content.length - 1].breakAfter = 1 : this.breakAtStart = 1, this.flushBuffer(), this.curLine = null, this.atCursorPos = !0, t--;
          continue;
        } else
          this.text = r, this.textOff = 0;
      }
      let s = Math.min(
        this.text.length - this.textOff,
        t,
        512
        /* T.Chunk */
      );
      this.flushBuffer(e.slice(e.length - i)), this.getLine().append(Yi(new Ft(this.text.slice(this.textOff, this.textOff + s)), e), i), this.atCursorPos = !0, this.textOff += s, t -= s, i = 0;
    }
  }
  span(t, e, i, s) {
    this.buildText(e - t, i, s), this.pos = e, this.openStart < 0 && (this.openStart = s);
  }
  point(t, e, i, s, r, o) {
    if (this.disallowBlockEffectsFor[o] && i instanceof xe) {
      if (i.block)
        throw new RangeError("Block decorations may not be specified via plugins");
      if (e > this.doc.lineAt(this.pos).to)
        throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
    }
    let l = e - t;
    if (i instanceof xe)
      if (i.block)
        i.startSide > 0 && !this.posCovered() && this.getLine(), this.addBlockWidget(new ie(i.widget || Xe.block, l, i));
      else {
        let a = fe.create(i.widget || Xe.inline, l, l ? 0 : i.startSide), c = this.atCursorPos && !a.isEditable && r <= s.length && (t < e || i.startSide > 0), h = !a.isEditable && (t < e || r > s.length || i.startSide <= 0), f = this.getLine();
        this.pendingBuffer == 2 && !c && !a.isEditable && (this.pendingBuffer = 0), this.flushBuffer(s), c && (f.append(Yi(new Je(1), s), r), r = s.length + Math.max(0, r - s.length)), f.append(Yi(a, s), r), this.atCursorPos = h, this.pendingBuffer = h ? t < e || r > s.length ? 1 : 2 : 0, this.pendingBuffer && (this.bufferMarks = s.slice());
      }
    else this.doc.lineAt(this.pos).from == this.pos && this.getLine().addLineDeco(i);
    l && (this.textOff + l <= this.text.length ? this.textOff += l : (this.skip += l - (this.text.length - this.textOff), this.text = "", this.textOff = 0), this.pos = e), this.openStart < 0 && (this.openStart = r);
  }
  static build(t, e, i, s, r) {
    let o = new wi(t, e, i, r);
    return o.openEnd = H.spans(s, e, i, o), o.openStart < 0 && (o.openStart = o.openEnd), o.finish(o.openEnd), o;
  }
}
function Yi(n, t) {
  for (let e of t)
    n = new ne(e, [n], n.length);
  return n;
}
class Xe extends ke {
  constructor(t) {
    super(), this.tag = t;
  }
  eq(t) {
    return t.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(t) {
    return t.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return !0;
  }
}
Xe.inline = /* @__PURE__ */ new Xe("span");
Xe.block = /* @__PURE__ */ new Xe("div");
var Y = /* @__PURE__ */ function(n) {
  return n[n.LTR = 0] = "LTR", n[n.RTL = 1] = "RTL", n;
}(Y || (Y = {}));
const Ee = Y.LTR, Lr = Y.RTL;
function Sa(n) {
  let t = [];
  for (let e = 0; e < n.length; e++)
    t.push(1 << +n[e]);
  return t;
}
const pf = /* @__PURE__ */ Sa("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), mf = /* @__PURE__ */ Sa("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), Zs = /* @__PURE__ */ Object.create(null), qt = [];
for (let n of ["()", "[]", "{}"]) {
  let t = /* @__PURE__ */ n.charCodeAt(0), e = /* @__PURE__ */ n.charCodeAt(1);
  Zs[t] = e, Zs[e] = -t;
}
function Ca(n) {
  return n <= 247 ? pf[n] : 1424 <= n && n <= 1524 ? 2 : 1536 <= n && n <= 1785 ? mf[n - 1536] : 1774 <= n && n <= 2220 ? 4 : 8192 <= n && n <= 8204 ? 256 : 64336 <= n && n <= 65023 ? 4 : 1;
}
const gf = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class ue {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? Lr : Ee;
  }
  /**
  @internal
  */
  constructor(t, e, i) {
    this.from = t, this.to = e, this.level = i;
  }
  /**
  @internal
  */
  side(t, e) {
    return this.dir == e == t ? this.to : this.from;
  }
  /**
  @internal
  */
  forward(t, e) {
    return t == (this.dir == e);
  }
  /**
  @internal
  */
  static find(t, e, i, s) {
    let r = -1;
    for (let o = 0; o < t.length; o++) {
      let l = t[o];
      if (l.from <= e && l.to >= e) {
        if (l.level == i)
          return o;
        (r < 0 || (s != 0 ? s < 0 ? l.from < e : l.to > e : t[r].level > l.level)) && (r = o);
      }
    }
    if (r < 0)
      throw new RangeError("Index out of range");
    return r;
  }
}
function Aa(n, t) {
  if (n.length != t.length)
    return !1;
  for (let e = 0; e < n.length; e++) {
    let i = n[e], s = t[e];
    if (i.from != s.from || i.to != s.to || i.direction != s.direction || !Aa(i.inner, s.inner))
      return !1;
  }
  return !0;
}
const $ = [];
function yf(n, t, e, i, s) {
  for (let r = 0; r <= i.length; r++) {
    let o = r ? i[r - 1].to : t, l = r < i.length ? i[r].from : e, a = r ? 256 : s;
    for (let c = o, h = a, f = a; c < l; c++) {
      let u = Ca(n.charCodeAt(c));
      u == 512 ? u = h : u == 8 && f == 4 && (u = 16), $[c] = u == 4 ? 2 : u, u & 7 && (f = u), h = u;
    }
    for (let c = o, h = a, f = a; c < l; c++) {
      let u = $[c];
      if (u == 128)
        c < l - 1 && h == $[c + 1] && h & 24 ? u = $[c] = h : $[c] = 256;
      else if (u == 64) {
        let d = c + 1;
        for (; d < l && $[d] == 64; )
          d++;
        let p = c && h == 8 || d < e && $[d] == 8 ? f == 1 ? 1 : 8 : 256;
        for (let g = c; g < d; g++)
          $[g] = p;
        c = d - 1;
      } else u == 8 && f == 1 && ($[c] = 1);
      h = u, u & 7 && (f = u);
    }
  }
}
function bf(n, t, e, i, s) {
  let r = s == 1 ? 2 : 1;
  for (let o = 0, l = 0, a = 0; o <= i.length; o++) {
    let c = o ? i[o - 1].to : t, h = o < i.length ? i[o].from : e;
    for (let f = c, u, d, p; f < h; f++)
      if (d = Zs[u = n.charCodeAt(f)])
        if (d < 0) {
          for (let g = l - 3; g >= 0; g -= 3)
            if (qt[g + 1] == -d) {
              let y = qt[g + 2], b = y & 2 ? s : y & 4 ? y & 1 ? r : s : 0;
              b && ($[f] = $[qt[g]] = b), l = g;
              break;
            }
        } else {
          if (qt.length == 189)
            break;
          qt[l++] = f, qt[l++] = u, qt[l++] = a;
        }
      else if ((p = $[f]) == 2 || p == 1) {
        let g = p == s;
        a = g ? 0 : 1;
        for (let y = l - 3; y >= 0; y -= 3) {
          let b = qt[y + 2];
          if (b & 2)
            break;
          if (g)
            qt[y + 2] |= 2;
          else {
            if (b & 4)
              break;
            qt[y + 2] |= 4;
          }
        }
      }
  }
}
function xf(n, t, e, i) {
  for (let s = 0, r = i; s <= e.length; s++) {
    let o = s ? e[s - 1].to : n, l = s < e.length ? e[s].from : t;
    for (let a = o; a < l; ) {
      let c = $[a];
      if (c == 256) {
        let h = a + 1;
        for (; ; )
          if (h == l) {
            if (s == e.length)
              break;
            h = e[s++].to, l = s < e.length ? e[s].from : t;
          } else if ($[h] == 256)
            h++;
          else
            break;
        let f = r == 1, u = (h < t ? $[h] : i) == 1, d = f == u ? f ? 1 : 2 : i;
        for (let p = h, g = s, y = g ? e[g - 1].to : n; p > a; )
          p == y && (p = e[--g].from, y = g ? e[g - 1].to : n), $[--p] = d;
        a = h;
      } else
        r = c, a++;
    }
  }
}
function tr(n, t, e, i, s, r, o) {
  let l = i % 2 ? 2 : 1;
  if (i % 2 == s % 2)
    for (let a = t, c = 0; a < e; ) {
      let h = !0, f = !1;
      if (c == r.length || a < r[c].from) {
        let g = $[a];
        g != l && (h = !1, f = g == 16);
      }
      let u = !h && l == 1 ? [] : null, d = h ? i : i + 1, p = a;
      t: for (; ; )
        if (c < r.length && p == r[c].from) {
          if (f)
            break t;
          let g = r[c];
          if (!h)
            for (let y = g.to, b = c + 1; ; ) {
              if (y == e)
                break t;
              if (b < r.length && r[b].from == y)
                y = r[b++].to;
              else {
                if ($[y] == l)
                  break t;
                break;
              }
            }
          if (c++, u)
            u.push(g);
          else {
            g.from > a && o.push(new ue(a, g.from, d));
            let y = g.direction == Ee != !(d % 2);
            er(n, y ? i + 1 : i, s, g.inner, g.from, g.to, o), a = g.to;
          }
          p = g.to;
        } else {
          if (p == e || (h ? $[p] != l : $[p] == l))
            break;
          p++;
        }
      u ? tr(n, a, p, i + 1, s, u, o) : a < p && o.push(new ue(a, p, d)), a = p;
    }
  else
    for (let a = e, c = r.length; a > t; ) {
      let h = !0, f = !1;
      if (!c || a > r[c - 1].to) {
        let g = $[a - 1];
        g != l && (h = !1, f = g == 16);
      }
      let u = !h && l == 1 ? [] : null, d = h ? i : i + 1, p = a;
      t: for (; ; )
        if (c && p == r[c - 1].to) {
          if (f)
            break t;
          let g = r[--c];
          if (!h)
            for (let y = g.from, b = c; ; ) {
              if (y == t)
                break t;
              if (b && r[b - 1].to == y)
                y = r[--b].from;
              else {
                if ($[y - 1] == l)
                  break t;
                break;
              }
            }
          if (u)
            u.push(g);
          else {
            g.to < a && o.push(new ue(g.to, a, d));
            let y = g.direction == Ee != !(d % 2);
            er(n, y ? i + 1 : i, s, g.inner, g.from, g.to, o), a = g.from;
          }
          p = g.from;
        } else {
          if (p == t || (h ? $[p - 1] != l : $[p - 1] == l))
            break;
          p--;
        }
      u ? tr(n, p, a, i + 1, s, u, o) : p < a && o.push(new ue(p, a, d)), a = p;
    }
}
function er(n, t, e, i, s, r, o) {
  let l = t % 2 ? 2 : 1;
  yf(n, s, r, i, l), bf(n, s, r, i, l), xf(s, r, i, l), tr(n, s, r, t, e, i, o);
}
function wf(n, t, e) {
  if (!n)
    return [new ue(0, 0, t == Lr ? 1 : 0)];
  if (t == Ee && !e.length && !gf.test(n))
    return Ma(n.length);
  if (e.length)
    for (; n.length > $.length; )
      $[$.length] = 256;
  let i = [], s = t == Ee ? 0 : 1;
  return er(n, s, s, e, 0, n.length, i), i;
}
function Ma(n) {
  return [new ue(0, n, 0)];
}
let Da = "";
function vf(n, t, e, i, s) {
  var r;
  let o = i.head - n.from, l = ue.find(t, o, (r = i.bidiLevel) !== null && r !== void 0 ? r : -1, i.assoc), a = t[l], c = a.side(s, e);
  if (o == c) {
    let u = l += s ? 1 : -1;
    if (u < 0 || u >= t.length)
      return null;
    a = t[l = u], o = a.side(!s, e), c = a.side(s, e);
  }
  let h = lt(n.text, o, a.forward(s, e));
  (h < a.from || h > a.to) && (h = c), Da = n.text.slice(Math.min(o, h), Math.max(o, h));
  let f = l == (s ? t.length - 1 : 0) ? null : t[l + (s ? 1 : -1)];
  return f && h == c && f.level + (s ? 0 : 1) < a.level ? x.cursor(f.side(!s, e) + n.from, f.forward(s, e) ? 1 : -1, f.level) : x.cursor(h + n.from, a.forward(s, e) ? -1 : 1, a.level);
}
function kf(n, t, e) {
  for (let i = t; i < e; i++) {
    let s = Ca(n.charCodeAt(i));
    if (s == 1)
      return Ee;
    if (s == 2 || s == 4)
      return Lr;
  }
  return Ee;
}
const Oa = /* @__PURE__ */ O.define(), Ta = /* @__PURE__ */ O.define(), Ba = /* @__PURE__ */ O.define(), La = /* @__PURE__ */ O.define(), ir = /* @__PURE__ */ O.define(), Ra = /* @__PURE__ */ O.define(), Pa = /* @__PURE__ */ O.define(), Rr = /* @__PURE__ */ O.define(), Pr = /* @__PURE__ */ O.define(), Ea = /* @__PURE__ */ O.define({
  combine: (n) => n.some((t) => t)
}), Ia = /* @__PURE__ */ O.define({
  combine: (n) => n.some((t) => t)
}), Na = /* @__PURE__ */ O.define();
class Ue {
  constructor(t, e = "nearest", i = "nearest", s = 5, r = 5, o = !1) {
    this.range = t, this.y = e, this.x = i, this.yMargin = s, this.xMargin = r, this.isSnapshot = o;
  }
  map(t) {
    return t.empty ? this : new Ue(this.range.map(t), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(t) {
    return this.range.to <= t.doc.length ? this : new Ue(x.cursor(t.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const _i = /* @__PURE__ */ R.define({ map: (n, t) => n.map(t) }), Fa = /* @__PURE__ */ R.define();
function wt(n, t, e) {
  let i = n.facet(La);
  i.length ? i[0](t) : window.onerror ? window.onerror(String(t), e, void 0, void 0, t) : e ? console.error(e + ":", t) : console.error(t);
}
const ae = /* @__PURE__ */ O.define({ combine: (n) => n.length ? n[0] : !0 });
let Sf = 0;
const fi = /* @__PURE__ */ O.define();
class Q {
  constructor(t, e, i, s, r) {
    this.id = t, this.create = e, this.domEventHandlers = i, this.domEventObservers = s, this.extension = r(this);
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(t, e) {
    const { eventHandlers: i, eventObservers: s, provide: r, decorations: o } = e || {};
    return new Q(Sf++, t, i, s, (l) => {
      let a = [fi.of(l)];
      return o && a.push(Di.of((c) => {
        let h = c.plugin(l);
        return h ? o(h) : B.none;
      })), r && a.push(r(l)), a;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(t, e) {
    return Q.define((i) => new t(i), e);
  }
}
class cs {
  constructor(t) {
    this.spec = t, this.mustUpdate = null, this.value = null;
  }
  update(t) {
    if (this.value) {
      if (this.mustUpdate) {
        let e = this.mustUpdate;
        if (this.mustUpdate = null, this.value.update)
          try {
            this.value.update(e);
          } catch (i) {
            if (wt(e.state, i, "CodeMirror plugin crashed"), this.value.destroy)
              try {
                this.value.destroy();
              } catch {
              }
            this.deactivate();
          }
      }
    } else if (this.spec)
      try {
        this.value = this.spec.create(t);
      } catch (e) {
        wt(t.state, e, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(t) {
    var e;
    if (!((e = this.value) === null || e === void 0) && e.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        wt(t.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const Ha = /* @__PURE__ */ O.define(), Er = /* @__PURE__ */ O.define(), Di = /* @__PURE__ */ O.define(), Va = /* @__PURE__ */ O.define(), Ir = /* @__PURE__ */ O.define(), Wa = /* @__PURE__ */ O.define();
function Ao(n, t) {
  let e = n.state.facet(Wa);
  if (!e.length)
    return e;
  let i = e.map((r) => r instanceof Function ? r(n) : r), s = [];
  return H.spans(i, t.from, t.to, {
    point() {
    },
    span(r, o, l, a) {
      let c = r - t.from, h = o - t.from, f = s;
      for (let u = l.length - 1; u >= 0; u--, a--) {
        let d = l[u].spec.bidiIsolate, p;
        if (d == null && (d = kf(t.text, c, h)), a > 0 && f.length && (p = f[f.length - 1]).to == c && p.direction == d)
          p.to = h, f = p.inner;
        else {
          let g = { from: c, to: h, direction: d, inner: [] };
          f.push(g), f = g.inner;
        }
      }
    }
  }), s;
}
const za = /* @__PURE__ */ O.define();
function qa(n) {
  let t = 0, e = 0, i = 0, s = 0;
  for (let r of n.state.facet(za)) {
    let o = r(n);
    o && (o.left != null && (t = Math.max(t, o.left)), o.right != null && (e = Math.max(e, o.right)), o.top != null && (i = Math.max(i, o.top)), o.bottom != null && (s = Math.max(s, o.bottom)));
  }
  return { left: t, right: e, top: i, bottom: s };
}
const ui = /* @__PURE__ */ O.define();
class Rt {
  constructor(t, e, i, s) {
    this.fromA = t, this.toA = e, this.fromB = i, this.toB = s;
  }
  join(t) {
    return new Rt(Math.min(this.fromA, t.fromA), Math.max(this.toA, t.toA), Math.min(this.fromB, t.fromB), Math.max(this.toB, t.toB));
  }
  addToSet(t) {
    let e = t.length, i = this;
    for (; e > 0; e--) {
      let s = t[e - 1];
      if (!(s.fromA > i.toA)) {
        if (s.toA < i.fromA)
          break;
        i = i.join(s), t.splice(e - 1, 1);
      }
    }
    return t.splice(e, 0, i), t;
  }
  static extendWithRanges(t, e) {
    if (e.length == 0)
      return t;
    let i = [];
    for (let s = 0, r = 0, o = 0, l = 0; ; s++) {
      let a = s == t.length ? null : t[s], c = o - l, h = a ? a.fromB : 1e9;
      for (; r < e.length && e[r] < h; ) {
        let f = e[r], u = e[r + 1], d = Math.max(l, f), p = Math.min(h, u);
        if (d <= p && new Rt(d + c, p + c, d, p).addToSet(i), u > h)
          break;
        r += 2;
      }
      if (!a)
        return i;
      new Rt(a.fromA, a.toA, a.fromB, a.toB).addToSet(i), o = a.toA, l = a.toB;
    }
  }
}
class On {
  constructor(t, e, i) {
    this.view = t, this.state = e, this.transactions = i, this.flags = 0, this.startState = t.state, this.changes = Z.empty(this.startState.doc.length);
    for (let r of i)
      this.changes = this.changes.compose(r.changes);
    let s = [];
    this.changes.iterChangedRanges((r, o, l, a) => s.push(new Rt(r, o, l, a))), this.changedRanges = s;
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new On(t, e, i);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & 10) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((t) => t.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
class Mo extends K {
  get length() {
    return this.view.state.doc.length;
  }
  constructor(t) {
    super(), this.view = t, this.decorations = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.markedForComposition = /* @__PURE__ */ new Set(), this.editContextFormatting = B.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.setDOM(t.contentDOM), this.children = [new X()], this.children[0].setParent(this), this.updateDeco(), this.updateInner([new Rt(0, 0, 0, t.state.doc.length)], 0, null);
  }
  // Update the document view to a given state.
  update(t) {
    var e;
    let i = t.changedRanges;
    this.minWidth > 0 && i.length && (i.every(({ fromA: c, toA: h }) => h < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = t.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = t.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(t);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((e = this.domChanged) === null || e === void 0) && e.newSel ? s = this.domChanged.newSel.head : !Bf(t.changes, this.hasComposition) && !t.selectionSet && (s = t.state.selection.main.head));
    let r = s > -1 ? Af(this.view, t.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      this.markedForComposition.clear();
      let { from: c, to: h } = this.hasComposition;
      i = new Rt(c, h, t.changes.mapPos(c, -1), t.changes.mapPos(h, 1)).addToSet(i.slice());
    }
    this.hasComposition = r ? { from: r.range.fromB, to: r.range.toB } : null, (T.ie || T.chrome) && !r && t && t.state.doc.lines != t.startState.doc.lines && (this.forceSelection = !0);
    let o = this.decorations, l = this.updateDeco(), a = Of(o, l, t.changes);
    return i = Rt.extendWithRanges(i, a), !(this.flags & 7) && i.length == 0 ? !1 : (this.updateInner(i, t.startState.doc.length, r), t.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(t, e, i) {
    this.view.viewState.mustMeasureContent = !0, this.updateChildren(t, e, i);
    let { observer: s } = this.view;
    s.ignore(() => {
      this.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = T.chrome || T.ios ? { node: s.selectionRange.focusNode, written: !1 } : void 0;
      this.sync(this.view, o), this.flags &= -8, o && (o.written || s.selectionRange.focusNode != o.node) && (this.forceSelection = !0), this.dom.style.height = "";
    }), this.markedForComposition.forEach(
      (o) => o.flags &= -9
      /* ViewFlag.Composition */
    );
    let r = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.children)
        o instanceof ie && o.widget instanceof Qs && r.push(o.dom);
    s.updateGaps(r);
  }
  updateChildren(t, e, i) {
    let s = i ? i.range.addToSet(t.slice()) : t, r = this.childCursor(e);
    for (let o = s.length - 1; ; o--) {
      let l = o >= 0 ? s[o] : null;
      if (!l)
        break;
      let { fromA: a, toA: c, fromB: h, toB: f } = l, u, d, p, g;
      if (i && i.range.fromB < f && i.range.toB > h) {
        let S = wi.build(this.view.state.doc, h, i.range.fromB, this.decorations, this.dynamicDecorationMap), v = wi.build(this.view.state.doc, i.range.toB, f, this.decorations, this.dynamicDecorationMap);
        d = S.breakAtStart, p = S.openStart, g = v.openEnd;
        let C = this.compositionView(i);
        v.breakAtStart ? C.breakAfter = 1 : v.content.length && C.merge(C.length, C.length, v.content[0], !1, v.openStart, 0) && (C.breakAfter = v.content[0].breakAfter, v.content.shift()), S.content.length && C.merge(0, 0, S.content[S.content.length - 1], !0, 0, S.openEnd) && S.content.pop(), u = S.content.concat(C).concat(v.content);
      } else
        ({ content: u, breakAtStart: d, openStart: p, openEnd: g } = wi.build(this.view.state.doc, h, f, this.decorations, this.dynamicDecorationMap));
      let { i: y, off: b } = r.findPos(c, 1), { i: w, off: k } = r.findPos(a, -1);
      ma(this, w, k, y, b, u, d, p, g);
    }
    i && this.fixCompositionDOM(i);
  }
  updateEditContextFormatting(t) {
    this.editContextFormatting = this.editContextFormatting.map(t.changes);
    for (let e of t.transactions)
      for (let i of e.effects)
        i.is(Fa) && (this.editContextFormatting = i.value);
  }
  compositionView(t) {
    let e = new Ft(t.text.nodeValue);
    e.flags |= 8;
    for (let { deco: s } of t.marks)
      e = new ne(s, [e], e.length);
    let i = new X();
    return i.append(e, 0), i;
  }
  fixCompositionDOM(t) {
    let e = (r, o) => {
      o.flags |= 8 | (o.children.some(
        (a) => a.flags & 7
        /* ViewFlag.Dirty */
      ) ? 1 : 0), this.markedForComposition.add(o);
      let l = K.get(r);
      l && l != o && (l.dom = null), o.setDOM(r);
    }, i = this.childPos(t.range.fromB, 1), s = this.children[i.i];
    e(t.line, s);
    for (let r = t.marks.length - 1; r >= -1; r--)
      i = s.childPos(i.off, 1), s = s.children[i.i], e(r >= 0 ? t.marks[r].node : t.text, s);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(t = !1, e = !1) {
    (t || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let i = this.view.root.activeElement, s = i == this.dom, r = !s && yn(this.dom, this.view.observer.selectionRange) && !(i && this.dom.contains(i));
    if (!(s || e || r))
      return;
    let o = this.forceSelection;
    this.forceSelection = !1;
    let l = this.view.state.selection.main, a = this.moveToLine(this.domAtPos(l.anchor)), c = l.empty ? a : this.moveToLine(this.domAtPos(l.head));
    if (T.gecko && l.empty && !this.hasComposition && Cf(a)) {
      let f = document.createTextNode("");
      this.view.observer.ignore(() => a.node.insertBefore(f, a.node.childNodes[a.offset] || null)), a = c = new ct(f, 0), o = !0;
    }
    let h = this.view.observer.selectionRange;
    (o || !h.focusNode || (!xi(a.node, a.offset, h.anchorNode, h.anchorOffset) || !xi(c.node, c.offset, h.focusNode, h.focusOffset)) && !this.suppressWidgetCursorChange(h, l)) && (this.view.observer.ignore(() => {
      T.android && T.chrome && this.dom.contains(h.focusNode) && Tf(h.focusNode, this.dom) && (this.dom.blur(), this.dom.focus({ preventScroll: !0 }));
      let f = Ai(this.view.root);
      if (f) if (l.empty) {
        if (T.gecko) {
          let u = Mf(a.node, a.offset);
          if (u && u != 3) {
            let d = (u == 1 ? ua : da)(a.node, a.offset);
            d && (a = new ct(d.node, d.offset));
          }
        }
        f.collapse(a.node, a.offset), l.bidiLevel != null && f.caretBidiLevel !== void 0 && (f.caretBidiLevel = l.bidiLevel);
      } else if (f.extend) {
        f.collapse(a.node, a.offset);
        try {
          f.extend(c.node, c.offset);
        } catch {
        }
      } else {
        let u = document.createRange();
        l.anchor > l.head && ([a, c] = [c, a]), u.setEnd(c.node, c.offset), u.setStart(a.node, a.offset), f.removeAllRanges(), f.addRange(u);
      }
      r && this.view.root.activeElement == this.dom && (this.dom.blur(), i && i.focus());
    }), this.view.observer.setSelectionRange(a, c)), this.impreciseAnchor = a.precise ? null : new ct(h.anchorNode, h.anchorOffset), this.impreciseHead = c.precise ? null : new ct(h.focusNode, h.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(t, e) {
    return this.hasComposition && e.empty && xi(t.focusNode, t.focusOffset, t.anchorNode, t.anchorOffset) && this.posFromDOM(t.focusNode, t.focusOffset) == e.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: t } = this, e = t.state.selection.main, i = Ai(t.root), { anchorNode: s, anchorOffset: r } = t.observer.selectionRange;
    if (!i || !e.empty || !e.assoc || !i.modify)
      return;
    let o = X.find(this, e.head);
    if (!o)
      return;
    let l = o.posAtStart;
    if (e.head == l || e.head == l + o.length)
      return;
    let a = this.coordsAt(e.head, -1), c = this.coordsAt(e.head, 1);
    if (!a || !c || a.bottom > c.top)
      return;
    let h = this.domAtPos(e.head + e.assoc);
    i.collapse(h.node, h.offset), i.modify("move", e.assoc < 0 ? "forward" : "backward", "lineboundary"), t.observer.readSelectionRange();
    let f = t.observer.selectionRange;
    t.docView.posFromDOM(f.anchorNode, f.anchorOffset) != e.from && i.collapse(s, r);
  }
  // If a position is in/near a block widget, move it to a nearby text
  // line, since we don't want the cursor inside a block widget.
  moveToLine(t) {
    let e = this.dom, i;
    if (t.node != e)
      return t;
    for (let s = t.offset; !i && s < e.childNodes.length; s++) {
      let r = K.get(e.childNodes[s]);
      r instanceof X && (i = r.domAtPos(0));
    }
    for (let s = t.offset - 1; !i && s >= 0; s--) {
      let r = K.get(e.childNodes[s]);
      r instanceof X && (i = r.domAtPos(r.length));
    }
    return i ? new ct(i.node, i.offset, !0) : t;
  }
  nearest(t) {
    for (let e = t; e; ) {
      let i = K.get(e);
      if (i && i.rootView == this)
        return i;
      e = e.parentNode;
    }
    return null;
  }
  posFromDOM(t, e) {
    let i = this.nearest(t);
    if (!i)
      throw new RangeError("Trying to find position for a DOM position outside of the document");
    return i.localPosFromDOM(t, e) + i.posAtStart;
  }
  domAtPos(t) {
    let { i: e, off: i } = this.childCursor().findPos(t, -1);
    for (; e < this.children.length - 1; ) {
      let s = this.children[e];
      if (i < s.length || s instanceof X)
        break;
      e++, i = 0;
    }
    return this.children[e].domAtPos(i);
  }
  coordsAt(t, e) {
    let i = null, s = 0;
    for (let r = this.length, o = this.children.length - 1; o >= 0; o--) {
      let l = this.children[o], a = r - l.breakAfter, c = a - l.length;
      if (a < t)
        break;
      if (c <= t && (c < t || l.covers(-1)) && (a > t || l.covers(1)) && (!i || l instanceof X && !(i instanceof X && e >= 0)))
        i = l, s = c;
      else if (i && c == t && a == t && l instanceof ie && Math.abs(e) < 2) {
        if (l.deco.startSide < 0)
          break;
        o && (i = null);
      }
      r = c;
    }
    return i ? i.coordsAt(t - s, e) : null;
  }
  coordsForChar(t) {
    let { i: e, off: i } = this.childPos(t, 1), s = this.children[e];
    if (!(s instanceof X))
      return null;
    for (; s.children.length; ) {
      let { i: l, off: a } = s.childPos(i, 1);
      for (; ; l++) {
        if (l == s.children.length)
          return null;
        if ((s = s.children[l]).length)
          break;
      }
      i = a;
    }
    if (!(s instanceof Ft))
      return null;
    let r = lt(s.text, i);
    if (r == i)
      return null;
    let o = Pe(s.dom, i, r).getClientRects();
    for (let l = 0; l < o.length; l++) {
      let a = o[l];
      if (l == o.length - 1 || a.top < a.bottom && a.left < a.right)
        return a;
    }
    return null;
  }
  measureVisibleLineHeights(t) {
    let e = [], { from: i, to: s } = t, r = this.view.contentDOM.clientWidth, o = r > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == Y.LTR;
    for (let c = 0, h = 0; h < this.children.length; h++) {
      let f = this.children[h], u = c + f.length;
      if (u > s)
        break;
      if (c >= i) {
        let d = f.dom.getBoundingClientRect();
        if (e.push(d.height), o) {
          let p = f.dom.lastChild, g = p ? Mi(p) : [];
          if (g.length) {
            let y = g[g.length - 1], b = a ? y.right - d.left : d.right - y.left;
            b > l && (l = b, this.minWidth = r, this.minWidthFrom = c, this.minWidthTo = u);
          }
        }
      }
      c = u + f.breakAfter;
    }
    return e;
  }
  textDirectionAt(t) {
    let { i: e } = this.childPos(t, 1);
    return getComputedStyle(this.children[e].dom).direction == "rtl" ? Y.RTL : Y.LTR;
  }
  measureTextSize() {
    for (let r of this.children)
      if (r instanceof X) {
        let o = r.measureTextSize();
        if (o)
          return o;
      }
    let t = document.createElement("div"), e, i, s;
    return t.className = "cm-line", t.style.width = "99999px", t.style.position = "absolute", t.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.dom.appendChild(t);
      let r = Mi(t.firstChild)[0];
      e = t.getBoundingClientRect().height, i = r ? r.width / 27 : 7, s = r ? r.height : e, t.remove();
    }), { lineHeight: e, charWidth: i, textHeight: s };
  }
  childCursor(t = this.length) {
    let e = this.children.length;
    return e && (t -= this.children[--e].length), new pa(this.children, t, e);
  }
  computeBlockGapDeco() {
    let t = [], e = this.view.viewState;
    for (let i = 0, s = 0; ; s++) {
      let r = s == e.viewports.length ? null : e.viewports[s], o = r ? r.from - 1 : this.length;
      if (o > i) {
        let l = (e.lineBlockAt(o).bottom - e.lineBlockAt(i).top) / this.view.scaleY;
        t.push(B.replace({
          widget: new Qs(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, o));
      }
      if (!r)
        break;
      i = r.to + 1;
    }
    return B.set(t);
  }
  updateDeco() {
    let t = 1, e = this.view.state.facet(Di).map((r) => (this.dynamicDecorationMap[t++] = typeof r == "function") ? r(this.view) : r), i = !1, s = this.view.state.facet(Va).map((r, o) => {
      let l = typeof r == "function";
      return l && (i = !0), l ? r(this.view) : r;
    });
    for (s.length && (this.dynamicDecorationMap[t++] = i, e.push(H.join(s))), this.decorations = [
      this.editContextFormatting,
      ...e,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; t < this.decorations.length; )
      this.dynamicDecorationMap[t++] = !1;
    return this.decorations;
  }
  scrollIntoView(t) {
    if (t.isSnapshot) {
      let c = this.view.viewState.lineBlockAt(t.range.head);
      this.view.scrollDOM.scrollTop = c.top - t.yMargin, this.view.scrollDOM.scrollLeft = t.xMargin;
      return;
    }
    for (let c of this.view.state.facet(Na))
      try {
        if (c(this.view, t.range, t))
          return !0;
      } catch (h) {
        wt(this.view.state, h, "scroll handler");
      }
    let { range: e } = t, i = this.coordsAt(e.head, e.empty ? e.assoc : e.head > e.anchor ? -1 : 1), s;
    if (!i)
      return;
    !e.empty && (s = this.coordsAt(e.anchor, e.anchor > e.head ? -1 : 1)) && (i = {
      left: Math.min(i.left, s.left),
      top: Math.min(i.top, s.top),
      right: Math.max(i.right, s.right),
      bottom: Math.max(i.bottom, s.bottom)
    });
    let r = qa(this.view), o = {
      left: i.left - r.left,
      top: i.top - r.top,
      right: i.right + r.right,
      bottom: i.bottom + r.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    sf(this.view.scrollDOM, o, e.head < e.anchor ? -1 : 1, t.x, t.y, Math.max(Math.min(t.xMargin, l), -l), Math.max(Math.min(t.yMargin, a), -a), this.view.textDirection == Y.LTR);
  }
}
function Cf(n) {
  return n.node.nodeType == 1 && n.node.firstChild && (n.offset == 0 || n.node.childNodes[n.offset - 1].contentEditable == "false") && (n.offset == n.node.childNodes.length || n.node.childNodes[n.offset].contentEditable == "false");
}
function $a(n, t) {
  let e = n.observer.selectionRange;
  if (!e.focusNode)
    return null;
  let i = ua(e.focusNode, e.focusOffset), s = da(e.focusNode, e.focusOffset), r = i || s;
  if (s && i && s.node != i.node) {
    let l = K.get(s.node);
    if (!l || l instanceof Ft && l.text != s.node.nodeValue)
      r = s;
    else if (n.docView.lastCompositionAfterCursor) {
      let a = K.get(i.node);
      !a || a instanceof Ft && a.text != i.node.nodeValue || (r = s);
    }
  }
  if (n.docView.lastCompositionAfterCursor = r != i, !r)
    return null;
  let o = t - r.offset;
  return { from: o, to: o + r.node.nodeValue.length, node: r.node };
}
function Af(n, t, e) {
  let i = $a(n, e);
  if (!i)
    return null;
  let { node: s, from: r, to: o } = i, l = s.nodeValue;
  if (/[\n\r]/.test(l) || n.state.doc.sliceString(i.from, i.to) != l)
    return null;
  let a = t.invertedDesc, c = new Rt(a.mapPos(r), a.mapPos(o), r, o), h = [];
  for (let f = s.parentNode; ; f = f.parentNode) {
    let u = K.get(f);
    if (u instanceof ne)
      h.push({ node: f, deco: u.mark });
    else {
      if (u instanceof X || f.nodeName == "DIV" && f.parentNode == n.contentDOM)
        return { range: c, text: s, marks: h, line: f };
      if (f != n.contentDOM)
        h.push({ node: f, deco: new Hi({
          inclusive: !0,
          attributes: uf(f),
          tagName: f.tagName.toLowerCase()
        }) });
      else
        return null;
    }
  }
}
function Mf(n, t) {
  return n.nodeType != 1 ? 0 : (t && n.childNodes[t - 1].contentEditable == "false" ? 1 : 0) | (t < n.childNodes.length && n.childNodes[t].contentEditable == "false" ? 2 : 0);
}
let Df = class {
  constructor() {
    this.changes = [];
  }
  compareRange(t, e) {
    Xs(t, e, this.changes);
  }
  comparePoint(t, e) {
    Xs(t, e, this.changes);
  }
};
function Of(n, t, e) {
  let i = new Df();
  return H.compare(n, t, e, i), i.changes;
}
function Tf(n, t) {
  for (let e = n; e && e != t; e = e.assignedSlot || e.parentNode)
    if (e.nodeType == 1 && e.contentEditable == "false")
      return !0;
  return !1;
}
function Bf(n, t) {
  let e = !1;
  return t && n.iterChangedRanges((i, s) => {
    i < t.to && s > t.from && (e = !0);
  }), e;
}
function Lf(n, t, e = 1) {
  let i = n.charCategorizer(t), s = n.doc.lineAt(t), r = t - s.from;
  if (s.length == 0)
    return x.cursor(t);
  r == 0 ? e = 1 : r == s.length && (e = -1);
  let o = r, l = r;
  e < 0 ? o = lt(s.text, r, !1) : l = lt(s.text, r);
  let a = i(s.text.slice(o, l));
  for (; o > 0; ) {
    let c = lt(s.text, o, !1);
    if (i(s.text.slice(c, o)) != a)
      break;
    o = c;
  }
  for (; l < s.length; ) {
    let c = lt(s.text, l);
    if (i(s.text.slice(l, c)) != a)
      break;
    l = c;
  }
  return x.range(o + s.from, l + s.from);
}
function Rf(n, t) {
  return t.left > n ? t.left - n : Math.max(0, n - t.right);
}
function Pf(n, t) {
  return t.top > n ? t.top - n : Math.max(0, n - t.bottom);
}
function fs(n, t) {
  return n.top < t.bottom - 1 && n.bottom > t.top + 1;
}
function Do(n, t) {
  return t < n.top ? { top: t, left: n.left, right: n.right, bottom: n.bottom } : n;
}
function Oo(n, t) {
  return t > n.bottom ? { top: n.top, left: n.left, right: n.right, bottom: t } : n;
}
function nr(n, t, e) {
  let i, s, r, o, l = !1, a, c, h, f;
  for (let p = n.firstChild; p; p = p.nextSibling) {
    let g = Mi(p);
    for (let y = 0; y < g.length; y++) {
      let b = g[y];
      s && fs(s, b) && (b = Do(Oo(b, s.bottom), s.top));
      let w = Rf(t, b), k = Pf(e, b);
      if (w == 0 && k == 0)
        return p.nodeType == 3 ? To(p, t, e) : nr(p, t, e);
      if (!i || o > k || o == k && r > w) {
        i = p, s = b, r = w, o = k;
        let S = k ? e < b.top ? -1 : 1 : w ? t < b.left ? -1 : 1 : 0;
        l = !S || (S > 0 ? y < g.length - 1 : y > 0);
      }
      w == 0 ? e > b.bottom && (!h || h.bottom < b.bottom) ? (a = p, h = b) : e < b.top && (!f || f.top > b.top) && (c = p, f = b) : h && fs(h, b) ? h = Oo(h, b.bottom) : f && fs(f, b) && (f = Do(f, b.top));
    }
  }
  if (h && h.bottom >= e ? (i = a, s = h) : f && f.top <= e && (i = c, s = f), !i)
    return { node: n, offset: 0 };
  let u = Math.max(s.left, Math.min(s.right, t));
  if (i.nodeType == 3)
    return To(i, u, e);
  if (l && i.contentEditable != "false")
    return nr(i, u, e);
  let d = Array.prototype.indexOf.call(n.childNodes, i) + (t >= (s.left + s.right) / 2 ? 1 : 0);
  return { node: n, offset: d };
}
function To(n, t, e) {
  let i = n.nodeValue.length, s = -1, r = 1e9, o = 0;
  for (let l = 0; l < i; l++) {
    let a = Pe(n, l, l + 1).getClientRects();
    for (let c = 0; c < a.length; c++) {
      let h = a[c];
      if (h.top == h.bottom)
        continue;
      o || (o = t - h.left);
      let f = (h.top > e ? h.top - e : e - h.bottom) - 1;
      if (h.left - 1 <= t && h.right + 1 >= t && f < r) {
        let u = t >= (h.left + h.right) / 2, d = u;
        if ((T.chrome || T.gecko) && Pe(n, l).getBoundingClientRect().left == h.right && (d = !u), f <= 0)
          return { node: n, offset: l + (d ? 1 : 0) };
        s = l + (d ? 1 : 0), r = f;
      }
    }
  }
  return { node: n, offset: s > -1 ? s : o > 0 ? n.nodeValue.length : 0 };
}
function Ka(n, t, e, i = -1) {
  var s, r;
  let o = n.contentDOM.getBoundingClientRect(), l = o.top + n.viewState.paddingTop, a, { docHeight: c } = n.viewState, { x: h, y: f } = t, u = f - l;
  if (u < 0)
    return 0;
  if (u > c)
    return n.state.doc.length;
  for (let S = n.viewState.heightOracle.textHeight / 2, v = !1; a = n.elementAtHeight(u), a.type != gt.Text; )
    for (; u = i > 0 ? a.bottom + S : a.top - S, !(u >= 0 && u <= c); ) {
      if (v)
        return e ? null : 0;
      v = !0, i = -i;
    }
  f = l + u;
  let d = a.from;
  if (d < n.viewport.from)
    return n.viewport.from == 0 ? 0 : e ? null : Bo(n, o, a, h, f);
  if (d > n.viewport.to)
    return n.viewport.to == n.state.doc.length ? n.state.doc.length : e ? null : Bo(n, o, a, h, f);
  let p = n.dom.ownerDocument, g = n.root.elementFromPoint ? n.root : p, y = g.elementFromPoint(h, f);
  y && !n.contentDOM.contains(y) && (y = null), y || (h = Math.max(o.left + 1, Math.min(o.right - 1, h)), y = g.elementFromPoint(h, f), y && !n.contentDOM.contains(y) && (y = null));
  let b, w = -1;
  if (y && ((s = n.docView.nearest(y)) === null || s === void 0 ? void 0 : s.isEditable) != !1) {
    if (p.caretPositionFromPoint) {
      let S = p.caretPositionFromPoint(h, f);
      S && ({ offsetNode: b, offset: w } = S);
    } else if (p.caretRangeFromPoint) {
      let S = p.caretRangeFromPoint(h, f);
      S && ({ startContainer: b, startOffset: w } = S, (!n.contentDOM.contains(b) || T.safari && Ef(b, w, h) || T.chrome && If(b, w, h)) && (b = void 0));
    }
    b && (w = Math.min(Qt(b), w));
  }
  if (!b || !n.docView.dom.contains(b)) {
    let S = X.find(n.docView, d);
    if (!S)
      return u > a.top + a.height / 2 ? a.to : a.from;
    ({ node: b, offset: w } = nr(S.dom, h, f));
  }
  let k = n.docView.nearest(b);
  if (!k)
    return null;
  if (k.isWidget && ((r = k.dom) === null || r === void 0 ? void 0 : r.nodeType) == 1) {
    let S = k.dom.getBoundingClientRect();
    return t.y < S.top || t.y <= S.bottom && t.x <= (S.left + S.right) / 2 ? k.posAtStart : k.posAtEnd;
  } else
    return k.localPosFromDOM(b, w) + k.posAtStart;
}
function Bo(n, t, e, i, s) {
  let r = Math.round((i - t.left) * n.defaultCharacterWidth);
  if (n.lineWrapping && e.height > n.defaultLineHeight * 1.5) {
    let l = n.viewState.heightOracle.textHeight, a = Math.floor((s - e.top - (n.defaultLineHeight - l) * 0.5) / l);
    r += a * n.viewState.heightOracle.lineLength;
  }
  let o = n.state.sliceDoc(e.from, e.to);
  return e.from + qs(o, r, n.state.tabSize);
}
function Ef(n, t, e) {
  let i;
  if (n.nodeType != 3 || t != (i = n.nodeValue.length))
    return !1;
  for (let s = n.nextSibling; s; s = s.nextSibling)
    if (s.nodeType != 1 || s.nodeName != "BR")
      return !1;
  return Pe(n, i - 1, i).getBoundingClientRect().left > e;
}
function If(n, t, e) {
  if (t != 0)
    return !1;
  for (let s = n; ; ) {
    let r = s.parentNode;
    if (!r || r.nodeType != 1 || r.firstChild != s)
      return !1;
    if (r.classList.contains("cm-line"))
      break;
    s = r;
  }
  let i = n.nodeType == 1 ? n.getBoundingClientRect() : Pe(n, 0, Math.max(n.nodeValue.length, 1)).getBoundingClientRect();
  return e - i.left > 5;
}
function sr(n, t) {
  let e = n.lineBlockAt(t);
  if (Array.isArray(e.type)) {
    for (let i of e.type)
      if (i.to > t || i.to == t && (i.to == e.to || i.type == gt.Text))
        return i;
  }
  return e;
}
function Nf(n, t, e, i) {
  let s = sr(n, t.head), r = !i || s.type != gt.Text || !(n.lineWrapping || s.widgetLineBreaks) ? null : n.coordsAtPos(t.assoc < 0 && t.head > s.from ? t.head - 1 : t.head);
  if (r) {
    let o = n.dom.getBoundingClientRect(), l = n.textDirectionAt(s.from), a = n.posAtCoords({
      x: e == (l == Y.LTR) ? o.right - 1 : o.left + 1,
      y: (r.top + r.bottom) / 2
    });
    if (a != null)
      return x.cursor(a, e ? -1 : 1);
  }
  return x.cursor(e ? s.to : s.from, e ? -1 : 1);
}
function Lo(n, t, e, i) {
  let s = n.state.doc.lineAt(t.head), r = n.bidiSpans(s), o = n.textDirectionAt(s.from);
  for (let l = t, a = null; ; ) {
    let c = vf(s, r, o, l, e), h = Da;
    if (!c) {
      if (s.number == (e ? n.state.doc.lines : 1))
        return l;
      h = `
`, s = n.state.doc.line(s.number + (e ? 1 : -1)), r = n.bidiSpans(s), c = n.visualLineSide(s, !e);
    }
    if (a) {
      if (!a(h))
        return l;
    } else {
      if (!i)
        return c;
      a = i(h);
    }
    l = c;
  }
}
function Ff(n, t, e) {
  let i = n.state.charCategorizer(t), s = i(e);
  return (r) => {
    let o = i(r);
    return s == _.Space && (s = o), s == o;
  };
}
function Hf(n, t, e, i) {
  let s = t.head, r = e ? 1 : -1;
  if (s == (e ? n.state.doc.length : 0))
    return x.cursor(s, t.assoc);
  let o = t.goalColumn, l, a = n.contentDOM.getBoundingClientRect(), c = n.coordsAtPos(s, t.assoc || -1), h = n.documentTop;
  if (c)
    o == null && (o = c.left - a.left), l = r < 0 ? c.top : c.bottom;
  else {
    let d = n.viewState.lineBlockAt(s);
    o == null && (o = Math.min(a.right - a.left, n.defaultCharacterWidth * (s - d.from))), l = (r < 0 ? d.top : d.bottom) + h;
  }
  let f = a.left + o, u = i ?? n.viewState.heightOracle.textHeight >> 1;
  for (let d = 0; ; d += 10) {
    let p = l + (u + d) * r, g = Ka(n, { x: f, y: p }, !1, r);
    if (p < a.top || p > a.bottom || (r < 0 ? g < s : g > s)) {
      let y = n.docView.coordsForChar(g), b = !y || p < y.top ? -1 : 1;
      return x.cursor(g, b, void 0, o);
    }
  }
}
function bn(n, t, e) {
  for (; ; ) {
    let i = 0;
    for (let s of n)
      s.between(t - 1, t + 1, (r, o, l) => {
        if (t > r && t < o) {
          let a = i || e || (t - r < o - t ? -1 : 1);
          t = a < 0 ? r : o, i = a;
        }
      });
    if (!i)
      return t;
  }
}
function us(n, t, e) {
  let i = bn(n.state.facet(Ir).map((s) => s(n)), e.from, t.head > e.from ? -1 : 1);
  return i == e.from ? e : x.cursor(i, i < e.from ? 1 : -1);
}
const di = "￿";
class Vf {
  constructor(t, e) {
    this.points = t, this.text = "", this.lineSeparator = e.facet(F.lineSeparator);
  }
  append(t) {
    this.text += t;
  }
  lineBreak() {
    this.text += di;
  }
  readRange(t, e) {
    if (!t)
      return this;
    let i = t.parentNode;
    for (let s = t; ; ) {
      this.findPointBefore(i, s);
      let r = this.text.length;
      this.readNode(s);
      let o = s.nextSibling;
      if (o == e)
        break;
      let l = K.get(s), a = K.get(o);
      (l && a ? l.breakAfter : (l ? l.breakAfter : Mn(s)) || Mn(o) && (s.nodeName != "BR" || s.cmIgnore) && this.text.length > r) && this.lineBreak(), s = o;
    }
    return this.findPointBefore(i, e), this;
  }
  readTextNode(t) {
    let e = t.nodeValue;
    for (let i of this.points)
      i.node == t && (i.pos = this.text.length + Math.min(i.offset, e.length));
    for (let i = 0, s = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let r = -1, o = 1, l;
      if (this.lineSeparator ? (r = e.indexOf(this.lineSeparator, i), o = this.lineSeparator.length) : (l = s.exec(e)) && (r = l.index, o = l[0].length), this.append(e.slice(i, r < 0 ? e.length : r)), r < 0)
        break;
      if (this.lineBreak(), o > 1)
        for (let a of this.points)
          a.node == t && a.pos > this.text.length && (a.pos -= o - 1);
      i = r + o;
    }
  }
  readNode(t) {
    if (t.cmIgnore)
      return;
    let e = K.get(t), i = e && e.overrideDOMText;
    if (i != null) {
      this.findPointInside(t, i.length);
      for (let s = i.iter(); !s.next().done; )
        s.lineBreak ? this.lineBreak() : this.append(s.value);
    } else t.nodeType == 3 ? this.readTextNode(t) : t.nodeName == "BR" ? t.nextSibling && this.lineBreak() : t.nodeType == 1 && this.readRange(t.firstChild, null);
  }
  findPointBefore(t, e) {
    for (let i of this.points)
      i.node == t && t.childNodes[i.offset] == e && (i.pos = this.text.length);
  }
  findPointInside(t, e) {
    for (let i of this.points)
      (t.nodeType == 3 ? i.node == t : t.contains(i.node)) && (i.pos = this.text.length + (Wf(t, i.node, i.offset) ? e : 0));
  }
}
function Wf(n, t, e) {
  for (; ; ) {
    if (!t || e < Qt(t))
      return !1;
    if (t == n)
      return !0;
    e = Re(t) + 1, t = t.parentNode;
  }
}
class Ro {
  constructor(t, e) {
    this.node = t, this.offset = e, this.pos = -1;
  }
}
class zf {
  constructor(t, e, i, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = e > -1;
    let { impreciseHead: r, impreciseAnchor: o } = t.docView;
    if (t.state.readOnly && e > -1)
      this.newSel = null;
    else if (e > -1 && (this.bounds = t.docView.domBoundsAround(e, i, 0))) {
      let l = r || o ? [] : Kf(t), a = new Vf(l, t.state);
      a.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = a.text, this.newSel = jf(l, this.bounds.from);
    } else {
      let l = t.observer.selectionRange, a = r && r.node == l.focusNode && r.offset == l.focusOffset || !js(t.contentDOM, l.focusNode) ? t.state.selection.main.head : t.docView.posFromDOM(l.focusNode, l.focusOffset), c = o && o.node == l.anchorNode && o.offset == l.anchorOffset || !js(t.contentDOM, l.anchorNode) ? t.state.selection.main.anchor : t.docView.posFromDOM(l.anchorNode, l.anchorOffset), h = t.viewport;
      if ((T.ios || T.chrome) && t.state.selection.main.empty && a != c && (h.from > 0 || h.to < t.state.doc.length)) {
        let f = Math.min(a, c), u = Math.max(a, c), d = h.from - f, p = h.to - u;
        (d == 0 || d == 1 || f == 0) && (p == 0 || p == -1 || u == t.state.doc.length) && (a = 0, c = t.state.doc.length);
      }
      this.newSel = x.single(c, a);
    }
  }
}
function ja(n, t) {
  let e, { newSel: i } = t, s = n.state.selection.main, r = n.inputState.lastKeyTime > Date.now() - 100 ? n.inputState.lastKeyCode : -1;
  if (t.bounds) {
    let { from: o, to: l } = t.bounds, a = s.from, c = null;
    (r === 8 || T.android && t.text.length < l - o) && (a = s.to, c = "end");
    let h = $f(n.state.doc.sliceString(o, l, di), t.text, a - o, c);
    h && (T.chrome && r == 13 && h.toB == h.from + 2 && t.text.slice(h.from, h.toB) == di + di && h.toB--, e = {
      from: o + h.from,
      to: o + h.toA,
      insert: V.of(t.text.slice(h.from, h.toB).split(di))
    });
  } else i && (!n.hasFocus && n.state.facet(ae) || i.main.eq(s)) && (i = null);
  if (!e && !i)
    return !1;
  if (!e && t.typeOver && !s.empty && i && i.main.empty ? e = { from: s.from, to: s.to, insert: n.state.doc.slice(s.from, s.to) } : e && e.from >= s.from && e.to <= s.to && (e.from != s.from || e.to != s.to) && s.to - s.from - (e.to - e.from) <= 4 ? e = {
    from: s.from,
    to: s.to,
    insert: n.state.doc.slice(s.from, e.from).append(e.insert).append(n.state.doc.slice(e.to, s.to))
  } : (T.mac || T.android) && e && e.from == e.to && e.from == s.head - 1 && /^\. ?$/.test(e.insert.toString()) && n.contentDOM.getAttribute("autocorrect") == "off" ? (i && e.insert.length == 2 && (i = x.single(i.main.anchor - 1, i.main.head - 1)), e = { from: s.from, to: s.to, insert: V.of([" "]) }) : T.chrome && e && e.from == e.to && e.from == s.head && e.insert.toString() == `
 ` && n.lineWrapping && (i && (i = x.single(i.main.anchor - 1, i.main.head - 1)), e = { from: s.from, to: s.to, insert: V.of([" "]) }), e)
    return Nr(n, e, i, r);
  if (i && !i.main.eq(s)) {
    let o = !1, l = "select";
    return n.inputState.lastSelectionTime > Date.now() - 50 && (n.inputState.lastSelectionOrigin == "select" && (o = !0), l = n.inputState.lastSelectionOrigin), n.dispatch({ selection: i, scrollIntoView: o, userEvent: l }), !0;
  } else
    return !1;
}
function Nr(n, t, e, i = -1) {
  if (T.ios && n.inputState.flushIOSKey(t))
    return !0;
  let s = n.state.selection.main;
  if (T.android && (t.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (t.from == s.from || t.from == s.from - 1 && n.state.sliceDoc(t.from, s.from) == " ") && t.insert.length == 1 && t.insert.lines == 2 && je(n.contentDOM, "Enter", 13) || (t.from == s.from - 1 && t.to == s.to && t.insert.length == 0 || i == 8 && t.insert.length < t.to - t.from && t.to > s.head) && je(n.contentDOM, "Backspace", 8) || t.from == s.from && t.to == s.to + 1 && t.insert.length == 0 && je(n.contentDOM, "Delete", 46)))
    return !0;
  let r = t.insert.toString();
  n.inputState.composing >= 0 && n.inputState.composing++;
  let o, l = () => o || (o = qf(n, t, e));
  return n.state.facet(Ra).some((a) => a(n, t.from, t.to, r, l)) || n.dispatch(l()), !0;
}
function qf(n, t, e) {
  let i, s = n.state, r = s.selection.main;
  if (t.from >= r.from && t.to <= r.to && t.to - t.from >= (r.to - r.from) / 3 && (!e || e.main.empty && e.main.from == t.from + t.insert.length) && n.inputState.composing < 0) {
    let l = r.from < t.from ? s.sliceDoc(r.from, t.from) : "", a = r.to > t.to ? s.sliceDoc(t.to, r.to) : "";
    i = s.replaceSelection(n.state.toText(l + t.insert.sliceString(0, void 0, n.state.lineBreak) + a));
  } else {
    let l = s.changes(t), a = e && e.main.to <= l.newLength ? e.main : void 0;
    if (s.selection.ranges.length > 1 && n.inputState.composing >= 0 && t.to <= r.to && t.to >= r.to - 10) {
      let c = n.state.sliceDoc(t.from, t.to), h, f = e && $a(n, e.main.head);
      if (f) {
        let p = t.insert.length - (t.to - t.from);
        h = { from: f.from, to: f.to - p };
      } else
        h = n.state.doc.lineAt(r.head);
      let u = r.to - t.to, d = r.to - r.from;
      i = s.changeByRange((p) => {
        if (p.from == r.from && p.to == r.to)
          return { changes: l, range: a || p.map(l) };
        let g = p.to - u, y = g - c.length;
        if (p.to - p.from != d || n.state.sliceDoc(y, g) != c || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        p.to >= h.from && p.from <= h.to)
          return { range: p };
        let b = s.changes({ from: y, to: g, insert: t.insert }), w = p.to - r.to;
        return {
          changes: b,
          range: a ? x.range(Math.max(0, a.anchor + w), Math.max(0, a.head + w)) : p.map(b)
        };
      });
    } else
      i = {
        changes: l,
        selection: a && s.selection.replaceRange(a)
      };
  }
  let o = "input.type";
  return (n.composing || n.inputState.compositionPendingChange && n.inputState.compositionEndedAt > Date.now() - 50) && (n.inputState.compositionPendingChange = !1, o += ".compose", n.inputState.compositionFirstChange && (o += ".start", n.inputState.compositionFirstChange = !1)), s.update(i, { userEvent: o, scrollIntoView: !0 });
}
function $f(n, t, e, i) {
  let s = Math.min(n.length, t.length), r = 0;
  for (; r < s && n.charCodeAt(r) == t.charCodeAt(r); )
    r++;
  if (r == s && n.length == t.length)
    return null;
  let o = n.length, l = t.length;
  for (; o > 0 && l > 0 && n.charCodeAt(o - 1) == t.charCodeAt(l - 1); )
    o--, l--;
  if (i == "end") {
    let a = Math.max(0, r - Math.min(o, l));
    e -= o + a - r;
  }
  if (o < r && n.length < t.length) {
    let a = e <= r && e >= o ? r - e : 0;
    r -= a, l = r + (l - o), o = r;
  } else if (l < r) {
    let a = e <= r && e >= l ? r - e : 0;
    r -= a, o = r + (o - l), l = r;
  }
  return { from: r, toA: o, toB: l };
}
function Kf(n) {
  let t = [];
  if (n.root.activeElement != n.contentDOM)
    return t;
  let { anchorNode: e, anchorOffset: i, focusNode: s, focusOffset: r } = n.observer.selectionRange;
  return e && (t.push(new Ro(e, i)), (s != e || r != i) && t.push(new Ro(s, r))), t;
}
function jf(n, t) {
  if (n.length == 0)
    return null;
  let e = n[0].pos, i = n.length == 2 ? n[1].pos : e;
  return e > -1 && i > -1 ? x.single(e + t, i + t) : null;
}
class Uf {
  setSelectionOrigin(t) {
    this.lastSelectionOrigin = t, this.lastSelectionTime = Date.now();
  }
  constructor(t) {
    this.view = t, this.lastKeyCode = 0, this.lastKeyTime = 0, this.lastTouchTime = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.pendingIOSKey = void 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = t.hasFocus, T.safari && t.contentDOM.addEventListener("input", () => null), T.gecko && au(t.contentDOM.ownerDocument);
  }
  handleEvent(t) {
    !tu(this.view, t) || this.ignoreDuringComposition(t) || t.type == "keydown" && this.keydown(t) || this.runHandlers(t.type, t);
  }
  runHandlers(t, e) {
    let i = this.handlers[t];
    if (i) {
      for (let s of i.observers)
        s(this.view, e);
      for (let s of i.handlers) {
        if (e.defaultPrevented)
          break;
        if (s(this.view, e)) {
          e.preventDefault();
          break;
        }
      }
    }
  }
  ensureHandlers(t) {
    let e = Gf(t), i = this.handlers, s = this.view.contentDOM;
    for (let r in e)
      if (r != "scroll") {
        let o = !e[r].handlers.length, l = i[r];
        l && o != !l.handlers.length && (s.removeEventListener(r, this.handleEvent), l = null), l || s.addEventListener(r, this.handleEvent, { passive: o });
      }
    for (let r in i)
      r != "scroll" && !e[r] && s.removeEventListener(r, this.handleEvent);
    this.handlers = e;
  }
  keydown(t) {
    if (this.lastKeyCode = t.keyCode, this.lastKeyTime = Date.now(), t.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
      return !0;
    if (this.tabFocusMode > 0 && t.keyCode != 27 && Ga.indexOf(t.keyCode) < 0 && (this.tabFocusMode = -1), T.android && T.chrome && !t.synthetic && (t.keyCode == 13 || t.keyCode == 8))
      return this.view.observer.delayAndroidKey(t.key, t.keyCode), !0;
    let e;
    return T.ios && !t.synthetic && !t.altKey && !t.metaKey && ((e = Ua.find((i) => i.keyCode == t.keyCode)) && !t.ctrlKey || Yf.indexOf(t.key) > -1 && t.ctrlKey && !t.shiftKey) ? (this.pendingIOSKey = e || t, setTimeout(() => this.flushIOSKey(), 250), !0) : (t.keyCode != 229 && this.view.observer.forceFlush(), !1);
  }
  flushIOSKey(t) {
    let e = this.pendingIOSKey;
    return !e || e.key == "Enter" && t && t.from < t.to && /^\S+$/.test(t.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, je(this.view.contentDOM, e.key, e.keyCode, e instanceof KeyboardEvent ? e : void 0));
  }
  ignoreDuringComposition(t) {
    return /^key/.test(t.type) ? this.composing > 0 ? !0 : T.safari && !T.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1 : !1;
  }
  startMouseSelection(t) {
    this.mouseSelection && this.mouseSelection.destroy(), this.mouseSelection = t;
  }
  update(t) {
    this.view.observer.update(t), this.mouseSelection && this.mouseSelection.update(t), this.draggedContent && t.docChanged && (this.draggedContent = this.draggedContent.map(t.changes)), t.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
  }
  destroy() {
    this.mouseSelection && this.mouseSelection.destroy();
  }
}
function Po(n, t) {
  return (e, i) => {
    try {
      return t.call(n, i, e);
    } catch (s) {
      wt(e.state, s);
    }
  };
}
function Gf(n) {
  let t = /* @__PURE__ */ Object.create(null);
  function e(i) {
    return t[i] || (t[i] = { observers: [], handlers: [] });
  }
  for (let i of n) {
    let s = i.spec;
    if (s && s.domEventHandlers)
      for (let r in s.domEventHandlers) {
        let o = s.domEventHandlers[r];
        o && e(r).handlers.push(Po(i.value, o));
      }
    if (s && s.domEventObservers)
      for (let r in s.domEventObservers) {
        let o = s.domEventObservers[r];
        o && e(r).observers.push(Po(i.value, o));
      }
  }
  for (let i in Ht)
    e(i).handlers.push(Ht[i]);
  for (let i in Et)
    e(i).observers.push(Et[i]);
  return t;
}
const Ua = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], Yf = "dthko", Ga = [16, 17, 18, 20, 91, 92, 224, 225], Ji = 6;
function Xi(n) {
  return Math.max(0, n) * 0.7 + 8;
}
function _f(n, t) {
  return Math.max(Math.abs(n.clientX - t.clientX), Math.abs(n.clientY - t.clientY));
}
class Jf {
  constructor(t, e, i, s) {
    this.view = t, this.startEvent = e, this.style = i, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = e, this.scrollParents = rf(t.contentDOM), this.atoms = t.state.facet(Ir).map((o) => o(t));
    let r = t.contentDOM.ownerDocument;
    r.addEventListener("mousemove", this.move = this.move.bind(this)), r.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = e.shiftKey, this.multiple = t.state.facet(F.allowMultipleSelections) && Xf(t, e), this.dragging = Zf(t, e) && Ja(e) == 1 ? null : !1;
  }
  start(t) {
    this.dragging === !1 && this.select(t);
  }
  move(t) {
    if (t.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && _f(this.startEvent, t) < 10)
      return;
    this.select(this.lastEvent = t);
    let e = 0, i = 0, s = 0, r = 0, o = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: o } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: r, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = qa(this.view);
    t.clientX - a.left <= s + Ji ? e = -Xi(s - t.clientX) : t.clientX + a.right >= o - Ji && (e = Xi(t.clientX - o)), t.clientY - a.top <= r + Ji ? i = -Xi(r - t.clientY) : t.clientY + a.bottom >= l - Ji && (i = Xi(t.clientY - l)), this.setScrollSpeed(e, i);
  }
  up(t) {
    this.dragging == null && this.select(this.lastEvent), this.dragging || t.preventDefault(), this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let t = this.view.contentDOM.ownerDocument;
    t.removeEventListener("mousemove", this.move), t.removeEventListener("mouseup", this.up), this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
  }
  setScrollSpeed(t, e) {
    this.scrollSpeed = { x: t, y: e }, t || e ? this.scrolling < 0 && (this.scrolling = setInterval(() => this.scroll(), 50)) : this.scrolling > -1 && (clearInterval(this.scrolling), this.scrolling = -1);
  }
  scroll() {
    let { x: t, y: e } = this.scrollSpeed;
    t && this.scrollParents.x && (this.scrollParents.x.scrollLeft += t, t = 0), e && this.scrollParents.y && (this.scrollParents.y.scrollTop += e, e = 0), (t || e) && this.view.win.scrollBy(t, e), this.dragging === !1 && this.select(this.lastEvent);
  }
  skipAtoms(t) {
    let e = null;
    for (let i = 0; i < t.ranges.length; i++) {
      let s = t.ranges[i], r = null;
      if (s.empty) {
        let o = bn(this.atoms, s.from, 0);
        o != s.from && (r = x.cursor(o, -1));
      } else {
        let o = bn(this.atoms, s.from, -1), l = bn(this.atoms, s.to, 1);
        (o != s.from || l != s.to) && (r = x.range(s.from == s.anchor ? o : l, s.from == s.head ? o : l));
      }
      r && (e || (e = t.ranges.slice()), e[i] = r);
    }
    return e ? x.create(e, t.mainIndex) : t;
  }
  select(t) {
    let { view: e } = this, i = this.skipAtoms(this.style.get(t, this.extend, this.multiple));
    (this.mustSelect || !i.eq(e.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: i,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(t) {
    t.transactions.some((e) => e.isUserEvent("input.type")) ? this.destroy() : this.style.update(t) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function Xf(n, t) {
  let e = n.state.facet(Oa);
  return e.length ? e[0](t) : T.mac ? t.metaKey : t.ctrlKey;
}
function Qf(n, t) {
  let e = n.state.facet(Ta);
  return e.length ? e[0](t) : T.mac ? !t.altKey : !t.ctrlKey;
}
function Zf(n, t) {
  let { main: e } = n.state.selection;
  if (e.empty)
    return !1;
  let i = Ai(n.root);
  if (!i || i.rangeCount == 0)
    return !0;
  let s = i.getRangeAt(0).getClientRects();
  for (let r = 0; r < s.length; r++) {
    let o = s[r];
    if (o.left <= t.clientX && o.right >= t.clientX && o.top <= t.clientY && o.bottom >= t.clientY)
      return !0;
  }
  return !1;
}
function tu(n, t) {
  if (!t.bubbles)
    return !0;
  if (t.defaultPrevented)
    return !1;
  for (let e = t.target, i; e != n.contentDOM; e = e.parentNode)
    if (!e || e.nodeType == 11 || (i = K.get(e)) && i.ignoreEvent(t))
      return !1;
  return !0;
}
const Ht = /* @__PURE__ */ Object.create(null), Et = /* @__PURE__ */ Object.create(null), Ya = T.ie && T.ie_version < 15 || T.ios && T.webkit_version < 604;
function eu(n) {
  let t = n.dom.parentNode;
  if (!t)
    return;
  let e = t.appendChild(document.createElement("textarea"));
  e.style.cssText = "position: fixed; left: -10000px; top: 10px", e.focus(), setTimeout(() => {
    n.focus(), e.remove(), _a(n, e.value);
  }, 50);
}
function Qn(n, t, e) {
  for (let i of n.facet(t))
    e = i(e, n);
  return e;
}
function _a(n, t) {
  t = Qn(n.state, Rr, t);
  let { state: e } = n, i, s = 1, r = e.toText(t), o = r.lines == e.selection.ranges.length;
  if (rr != null && e.selection.ranges.every((a) => a.empty) && rr == r.toString()) {
    let a = -1;
    i = e.changeByRange((c) => {
      let h = e.doc.lineAt(c.from);
      if (h.from == a)
        return { range: c };
      a = h.from;
      let f = e.toText((o ? r.line(s++).text : t) + e.lineBreak);
      return {
        changes: { from: h.from, insert: f },
        range: x.cursor(c.from + f.length)
      };
    });
  } else o ? i = e.changeByRange((a) => {
    let c = r.line(s++);
    return {
      changes: { from: a.from, to: a.to, insert: c.text },
      range: x.cursor(a.from + c.length)
    };
  }) : i = e.replaceSelection(r);
  n.dispatch(i, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
Et.scroll = (n) => {
  n.inputState.lastScrollTop = n.scrollDOM.scrollTop, n.inputState.lastScrollLeft = n.scrollDOM.scrollLeft;
};
Ht.keydown = (n, t) => (n.inputState.setSelectionOrigin("select"), t.keyCode == 27 && n.inputState.tabFocusMode != 0 && (n.inputState.tabFocusMode = Date.now() + 2e3), !1);
Et.touchstart = (n, t) => {
  n.inputState.lastTouchTime = Date.now(), n.inputState.setSelectionOrigin("select.pointer");
};
Et.touchmove = (n) => {
  n.inputState.setSelectionOrigin("select.pointer");
};
Ht.mousedown = (n, t) => {
  if (n.observer.flush(), n.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let e = null;
  for (let i of n.state.facet(Ba))
    if (e = i(n, t), e)
      break;
  if (!e && t.button == 0 && (e = su(n, t)), e) {
    let i = !n.hasFocus;
    n.inputState.startMouseSelection(new Jf(n, t, e, i)), i && n.observer.ignore(() => {
      ha(n.contentDOM);
      let r = n.root.activeElement;
      r && !r.contains(n.contentDOM) && r.blur();
    });
    let s = n.inputState.mouseSelection;
    if (s)
      return s.start(t), s.dragging === !1;
  }
  return !1;
};
function Eo(n, t, e, i) {
  if (i == 1)
    return x.cursor(t, e);
  if (i == 2)
    return Lf(n.state, t, e);
  {
    let s = X.find(n.docView, t), r = n.state.doc.lineAt(s ? s.posAtEnd : t), o = s ? s.posAtStart : r.from, l = s ? s.posAtEnd : r.to;
    return l < n.state.doc.length && l == r.to && l++, x.range(o, l);
  }
}
let Io = (n, t, e) => t >= e.top && t <= e.bottom && n >= e.left && n <= e.right;
function iu(n, t, e, i) {
  let s = X.find(n.docView, t);
  if (!s)
    return 1;
  let r = t - s.posAtStart;
  if (r == 0)
    return 1;
  if (r == s.length)
    return -1;
  let o = s.coordsAt(r, -1);
  if (o && Io(e, i, o))
    return -1;
  let l = s.coordsAt(r, 1);
  return l && Io(e, i, l) ? 1 : o && o.bottom >= i ? -1 : 1;
}
function No(n, t) {
  let e = n.posAtCoords({ x: t.clientX, y: t.clientY }, !1);
  return { pos: e, bias: iu(n, e, t.clientX, t.clientY) };
}
const nu = T.ie && T.ie_version <= 11;
let Fo = null, Ho = 0, Vo = 0;
function Ja(n) {
  if (!nu)
    return n.detail;
  let t = Fo, e = Vo;
  return Fo = n, Vo = Date.now(), Ho = !t || e > Date.now() - 400 && Math.abs(t.clientX - n.clientX) < 2 && Math.abs(t.clientY - n.clientY) < 2 ? (Ho + 1) % 3 : 1;
}
function su(n, t) {
  let e = No(n, t), i = Ja(t), s = n.state.selection;
  return {
    update(r) {
      r.docChanged && (e.pos = r.changes.mapPos(e.pos), s = s.map(r.changes));
    },
    get(r, o, l) {
      let a = No(n, r), c, h = Eo(n, a.pos, a.bias, i);
      if (e.pos != a.pos && !o) {
        let f = Eo(n, e.pos, e.bias, i), u = Math.min(f.from, h.from), d = Math.max(f.to, h.to);
        h = u < h.from ? x.range(u, d) : x.range(d, u);
      }
      return o ? s.replaceRange(s.main.extend(h.from, h.to)) : l && i == 1 && s.ranges.length > 1 && (c = ru(s, a.pos)) ? c : l ? s.addRange(h) : x.create([h]);
    }
  };
}
function ru(n, t) {
  for (let e = 0; e < n.ranges.length; e++) {
    let { from: i, to: s } = n.ranges[e];
    if (i <= t && s >= t)
      return x.create(n.ranges.slice(0, e).concat(n.ranges.slice(e + 1)), n.mainIndex == e ? 0 : n.mainIndex - (n.mainIndex > e ? 1 : 0));
  }
  return null;
}
Ht.dragstart = (n, t) => {
  let { selection: { main: e } } = n.state;
  if (t.target.draggable) {
    let s = n.docView.nearest(t.target);
    if (s && s.isWidget) {
      let r = s.posAtStart, o = r + s.length;
      (r >= e.to || o <= e.from) && (e = x.range(r, o));
    }
  }
  let { inputState: i } = n;
  return i.mouseSelection && (i.mouseSelection.dragging = !0), i.draggedContent = e, t.dataTransfer && (t.dataTransfer.setData("Text", Qn(n.state, Pr, n.state.sliceDoc(e.from, e.to))), t.dataTransfer.effectAllowed = "copyMove"), !1;
};
Ht.dragend = (n) => (n.inputState.draggedContent = null, !1);
function Wo(n, t, e, i) {
  if (e = Qn(n.state, Rr, e), !e)
    return;
  let s = n.posAtCoords({ x: t.clientX, y: t.clientY }, !1), { draggedContent: r } = n.inputState, o = i && r && Qf(n, t) ? { from: r.from, to: r.to } : null, l = { from: s, insert: e }, a = n.state.changes(o ? [o, l] : l);
  n.focus(), n.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(s, -1), head: a.mapPos(s, 1) },
    userEvent: o ? "move.drop" : "input.drop"
  }), n.inputState.draggedContent = null;
}
Ht.drop = (n, t) => {
  if (!t.dataTransfer)
    return !1;
  if (n.state.readOnly)
    return !0;
  let e = t.dataTransfer.files;
  if (e && e.length) {
    let i = Array(e.length), s = 0, r = () => {
      ++s == e.length && Wo(n, t, i.filter((o) => o != null).join(n.state.lineBreak), !1);
    };
    for (let o = 0; o < e.length; o++) {
      let l = new FileReader();
      l.onerror = r, l.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(l.result) || (i[o] = l.result), r();
      }, l.readAsText(e[o]);
    }
    return !0;
  } else {
    let i = t.dataTransfer.getData("Text");
    if (i)
      return Wo(n, t, i, !0), !0;
  }
  return !1;
};
Ht.paste = (n, t) => {
  if (n.state.readOnly)
    return !0;
  n.observer.flush();
  let e = Ya ? null : t.clipboardData;
  return e ? (_a(n, e.getData("text/plain") || e.getData("text/uri-list")), !0) : (eu(n), !1);
};
function ou(n, t) {
  let e = n.dom.parentNode;
  if (!e)
    return;
  let i = e.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = t, i.focus(), i.selectionEnd = t.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), n.focus();
  }, 50);
}
function lu(n) {
  let t = [], e = [], i = !1;
  for (let s of n.selection.ranges)
    s.empty || (t.push(n.sliceDoc(s.from, s.to)), e.push(s));
  if (!t.length) {
    let s = -1;
    for (let { from: r } of n.selection.ranges) {
      let o = n.doc.lineAt(r);
      o.number > s && (t.push(o.text), e.push({ from: o.from, to: Math.min(n.doc.length, o.to + 1) })), s = o.number;
    }
    i = !0;
  }
  return { text: Qn(n, Pr, t.join(n.lineBreak)), ranges: e, linewise: i };
}
let rr = null;
Ht.copy = Ht.cut = (n, t) => {
  let { text: e, ranges: i, linewise: s } = lu(n.state);
  if (!e && !s)
    return !1;
  rr = s ? e : null, t.type == "cut" && !n.state.readOnly && n.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let r = Ya ? null : t.clipboardData;
  return r ? (r.clearData(), r.setData("text/plain", e), !0) : (ou(n, e), !1);
};
const Xa = /* @__PURE__ */ re.define();
function Qa(n, t) {
  let e = [];
  for (let i of n.facet(Pa)) {
    let s = i(n, t);
    s && e.push(s);
  }
  return e ? n.update({ effects: e, annotations: Xa.of(!0) }) : null;
}
function Za(n) {
  setTimeout(() => {
    let t = n.hasFocus;
    if (t != n.inputState.notifiedFocused) {
      let e = Qa(n.state, t);
      e ? n.dispatch(e) : n.update([]);
    }
  }, 10);
}
Et.focus = (n) => {
  n.inputState.lastFocusTime = Date.now(), !n.scrollDOM.scrollTop && (n.inputState.lastScrollTop || n.inputState.lastScrollLeft) && (n.scrollDOM.scrollTop = n.inputState.lastScrollTop, n.scrollDOM.scrollLeft = n.inputState.lastScrollLeft), Za(n);
};
Et.blur = (n) => {
  n.observer.clearSelectionRange(), Za(n);
};
Et.compositionstart = Et.compositionupdate = (n) => {
  n.observer.editContext || (n.inputState.compositionFirstChange == null && (n.inputState.compositionFirstChange = !0), n.inputState.composing < 0 && (n.inputState.composing = 0));
};
Et.compositionend = (n) => {
  n.observer.editContext || (n.inputState.composing = -1, n.inputState.compositionEndedAt = Date.now(), n.inputState.compositionPendingKey = !0, n.inputState.compositionPendingChange = n.observer.pendingRecords().length > 0, n.inputState.compositionFirstChange = null, T.chrome && T.android ? n.observer.flushSoon() : n.inputState.compositionPendingChange ? Promise.resolve().then(() => n.observer.flush()) : setTimeout(() => {
    n.inputState.composing < 0 && n.docView.hasComposition && n.update([]);
  }, 50));
};
Et.contextmenu = (n) => {
  n.inputState.lastContextMenu = Date.now();
};
Ht.beforeinput = (n, t) => {
  var e, i;
  if (t.inputType == "insertReplacementText" && n.observer.editContext) {
    let r = (e = t.dataTransfer) === null || e === void 0 ? void 0 : e.getData("text/plain"), o = t.getTargetRanges();
    if (r && o.length) {
      let l = o[0], a = n.posAtDOM(l.startContainer, l.startOffset), c = n.posAtDOM(l.endContainer, l.endOffset);
      return Nr(n, { from: a, to: c, insert: n.state.toText(r) }, null), !0;
    }
  }
  let s;
  if (T.chrome && T.android && (s = Ua.find((r) => r.inputType == t.inputType)) && (n.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let r = ((i = window.visualViewport) === null || i === void 0 ? void 0 : i.height) || 0;
    setTimeout(() => {
      var o;
      (((o = window.visualViewport) === null || o === void 0 ? void 0 : o.height) || 0) > r + 10 && n.hasFocus && (n.contentDOM.blur(), n.focus());
    }, 100);
  }
  return T.ios && t.inputType == "deleteContentForward" && n.observer.flushSoon(), T.safari && t.inputType == "insertText" && n.inputState.composing >= 0 && setTimeout(() => Et.compositionend(n, t), 20), !1;
};
const zo = /* @__PURE__ */ new Set();
function au(n) {
  zo.has(n) || (zo.add(n), n.addEventListener("copy", () => {
  }), n.addEventListener("cut", () => {
  }));
}
const qo = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let Qe = !1;
function $o() {
  Qe = !1;
}
class hu {
  constructor(t) {
    this.lineWrapping = t, this.doc = V.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
  }
  heightForGap(t, e) {
    let i = this.doc.lineAt(e).number - this.doc.lineAt(t).number + 1;
    return this.lineWrapping && (i += Math.max(0, Math.ceil((e - t - i * this.lineLength * 0.5) / this.lineLength))), this.lineHeight * i;
  }
  heightForLine(t) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((t - this.lineLength) / (this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(t) {
    return this.doc = t, this;
  }
  mustRefreshForWrapping(t) {
    return qo.indexOf(t) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(t) {
    let e = !1;
    for (let i = 0; i < t.length; i++) {
      let s = t[i];
      s < 0 ? i++ : this.heightSamples[Math.floor(s * 10)] || (e = !0, this.heightSamples[Math.floor(s * 10)] = !0);
    }
    return e;
  }
  refresh(t, e, i, s, r, o) {
    let l = qo.indexOf(t) > -1, a = Math.round(e) != Math.round(this.lineHeight) || this.lineWrapping != l;
    if (this.lineWrapping = l, this.lineHeight = e, this.charWidth = i, this.textHeight = s, this.lineLength = r, a) {
      this.heightSamples = {};
      for (let c = 0; c < o.length; c++) {
        let h = o[c];
        h < 0 ? c++ : this.heightSamples[Math.floor(h * 10)] = !0;
      }
    }
    return a;
  }
}
class cu {
  constructor(t, e) {
    this.from = t, this.heights = e, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class Gt {
  /**
  @internal
  */
  constructor(t, e, i, s, r) {
    this.from = t, this.length = e, this.top = i, this.height = s, this._content = r;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? gt.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  If this is a widget block, this will return the widget
  associated with it.
  */
  get widget() {
    return this._content instanceof xe ? this._content.widget : null;
  }
  /**
  If this is a textblock, this holds the number of line breaks
  that appear in widgets inside the block.
  */
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  /**
  @internal
  */
  join(t) {
    let e = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(t._content) ? t._content : [t]);
    return new Gt(this.from, this.length + t.length, this.top, this.height + t.height, e);
  }
}
var G = /* @__PURE__ */ function(n) {
  return n[n.ByPos = 0] = "ByPos", n[n.ByHeight = 1] = "ByHeight", n[n.ByPosNoHeight = 2] = "ByPosNoHeight", n;
}(G || (G = {}));
const xn = 1e-3;
class yt {
  constructor(t, e, i = 2) {
    this.length = t, this.height = e, this.flags = i;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(t) {
    this.flags = (t ? 2 : 0) | this.flags & -3;
  }
  setHeight(t) {
    this.height != t && (Math.abs(this.height - t) > xn && (Qe = !0), this.height = t);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(t, e, i) {
    return yt.of(i);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(t, e) {
    e.push(this);
  }
  decomposeRight(t, e) {
    e.push(this);
  }
  applyChanges(t, e, i, s) {
    let r = this, o = i.doc;
    for (let l = s.length - 1; l >= 0; l--) {
      let { fromA: a, toA: c, fromB: h, toB: f } = s[l], u = r.lineAt(a, G.ByPosNoHeight, i.setDoc(e), 0, 0), d = u.to >= c ? u : r.lineAt(c, G.ByPosNoHeight, i, 0, 0);
      for (f += d.to - c, c = d.to; l > 0 && u.from <= s[l - 1].toA; )
        a = s[l - 1].fromA, h = s[l - 1].fromB, l--, a < u.from && (u = r.lineAt(a, G.ByPosNoHeight, i, 0, 0));
      h += u.from - a, a = u.from;
      let p = Fr.build(i.setDoc(o), t, h, f);
      r = Tn(r, r.replace(a, c, p));
    }
    return r.updateHeight(i, 0);
  }
  static empty() {
    return new Ct(0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(t) {
    if (t.length == 1)
      return t[0];
    let e = 0, i = t.length, s = 0, r = 0;
    for (; ; )
      if (e == i)
        if (s > r * 2) {
          let l = t[e - 1];
          l.break ? t.splice(--e, 1, l.left, null, l.right) : t.splice(--e, 1, l.left, l.right), i += 1 + l.break, s -= l.size;
        } else if (r > s * 2) {
          let l = t[i];
          l.break ? t.splice(i, 1, l.left, null, l.right) : t.splice(i, 1, l.left, l.right), i += 2 + l.break, r -= l.size;
        } else
          break;
      else if (s < r) {
        let l = t[e++];
        l && (s += l.size);
      } else {
        let l = t[--i];
        l && (r += l.size);
      }
    let o = 0;
    return t[e - 1] == null ? (o = 1, e--) : t[e] == null && (o = 1, i++), new fu(yt.of(t.slice(0, e)), o, yt.of(t.slice(i)));
  }
}
function Tn(n, t) {
  return n == t ? n : (n.constructor != t.constructor && (Qe = !0), t);
}
yt.prototype.size = 1;
class th extends yt {
  constructor(t, e, i) {
    super(t, e), this.deco = i;
  }
  blockAt(t, e, i, s) {
    return new Gt(s, this.length, i, this.height, this.deco || 0);
  }
  lineAt(t, e, i, s, r) {
    return this.blockAt(0, i, s, r);
  }
  forEachLine(t, e, i, s, r, o) {
    t <= r + this.length && e >= r && o(this.blockAt(0, i, s, r));
  }
  updateHeight(t, e = 0, i = !1, s) {
    return s && s.from <= e && s.more && this.setHeight(s.heights[s.index++]), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class Ct extends th {
  constructor(t, e) {
    super(t, e, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0;
  }
  blockAt(t, e, i, s) {
    return new Gt(s, this.length, i, this.height, this.breaks);
  }
  replace(t, e, i) {
    let s = i[0];
    return i.length == 1 && (s instanceof Ct || s instanceof nt && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof nt ? s = new Ct(s.length, this.height) : s.height = this.height, this.outdated || (s.outdated = !1), s) : yt.of(i);
  }
  updateHeight(t, e = 0, i = !1, s) {
    return s && s.from <= e && s.more ? this.setHeight(s.heights[s.index++]) : (i || this.outdated) && this.setHeight(Math.max(this.widgetHeight, t.heightForLine(this.length - this.collapsed)) + this.breaks * t.lineHeight), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class nt extends yt {
  constructor(t) {
    super(t, 0);
  }
  heightMetrics(t, e) {
    let i = t.doc.lineAt(e).number, s = t.doc.lineAt(e + this.length).number, r = s - i + 1, o, l = 0;
    if (t.lineWrapping) {
      let a = Math.min(this.height, t.lineHeight * r);
      o = a / r, this.length > r + 1 && (l = (this.height - a) / (this.length - r - 1));
    } else
      o = this.height / r;
    return { firstLine: i, lastLine: s, perLine: o, perChar: l };
  }
  blockAt(t, e, i, s) {
    let { firstLine: r, lastLine: o, perLine: l, perChar: a } = this.heightMetrics(e, s);
    if (e.lineWrapping) {
      let c = s + (t < e.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (t - i) / this.height)) * this.length)), h = e.doc.lineAt(c), f = l + h.length * a, u = Math.max(i, t - f / 2);
      return new Gt(h.from, h.length, u, f, 0);
    } else {
      let c = Math.max(0, Math.min(o - r, Math.floor((t - i) / l))), { from: h, length: f } = e.doc.line(r + c);
      return new Gt(h, f, i + l * c, l, 0);
    }
  }
  lineAt(t, e, i, s, r) {
    if (e == G.ByHeight)
      return this.blockAt(t, i, s, r);
    if (e == G.ByPosNoHeight) {
      let { from: d, to: p } = i.doc.lineAt(t);
      return new Gt(d, p - d, 0, 0, 0);
    }
    let { firstLine: o, perLine: l, perChar: a } = this.heightMetrics(i, r), c = i.doc.lineAt(t), h = l + c.length * a, f = c.number - o, u = s + l * f + a * (c.from - r - f);
    return new Gt(c.from, c.length, Math.max(s, Math.min(u, s + this.height - h)), h, 0);
  }
  forEachLine(t, e, i, s, r, o) {
    t = Math.max(t, r), e = Math.min(e, r + this.length);
    let { firstLine: l, perLine: a, perChar: c } = this.heightMetrics(i, r);
    for (let h = t, f = s; h <= e; ) {
      let u = i.doc.lineAt(h);
      if (h == t) {
        let p = u.number - l;
        f += a * p + c * (t - r - p);
      }
      let d = a + c * u.length;
      o(new Gt(u.from, u.length, f, d, 0)), f += d, h = u.to + 1;
    }
  }
  replace(t, e, i) {
    let s = this.length - e;
    if (s > 0) {
      let r = i[i.length - 1];
      r instanceof nt ? i[i.length - 1] = new nt(r.length + s) : i.push(null, new nt(s - 1));
    }
    if (t > 0) {
      let r = i[0];
      r instanceof nt ? i[0] = new nt(t + r.length) : i.unshift(new nt(t - 1), null);
    }
    return yt.of(i);
  }
  decomposeLeft(t, e) {
    e.push(new nt(t - 1), null);
  }
  decomposeRight(t, e) {
    e.push(null, new nt(this.length - t - 1));
  }
  updateHeight(t, e = 0, i = !1, s) {
    let r = e + this.length;
    if (s && s.from <= e + this.length && s.more) {
      let o = [], l = Math.max(e, s.from), a = -1;
      for (s.from > e && o.push(new nt(s.from - e - 1).updateHeight(t, e)); l <= r && s.more; ) {
        let h = t.doc.lineAt(l).length;
        o.length && o.push(null);
        let f = s.heights[s.index++];
        a == -1 ? a = f : Math.abs(f - a) >= xn && (a = -2);
        let u = new Ct(h, f);
        u.outdated = !1, o.push(u), l += h + 1;
      }
      l <= r && o.push(null, new nt(r - l).updateHeight(t, l));
      let c = yt.of(o);
      return (a < 0 || Math.abs(c.height - this.height) >= xn || Math.abs(a - this.heightMetrics(t, e).perLine) >= xn) && (Qe = !0), Tn(this, c);
    } else (i || this.outdated) && (this.setHeight(t.heightForGap(e, e + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class fu extends yt {
  constructor(t, e, i) {
    super(t.length + e + i.length, t.height + i.height, e | (t.outdated || i.outdated ? 2 : 0)), this.left = t, this.right = i, this.size = t.size + i.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(t, e, i, s) {
    let r = i + this.left.height;
    return t < r ? this.left.blockAt(t, e, i, s) : this.right.blockAt(t, e, r, s + this.left.length + this.break);
  }
  lineAt(t, e, i, s, r) {
    let o = s + this.left.height, l = r + this.left.length + this.break, a = e == G.ByHeight ? t < o : t < l, c = a ? this.left.lineAt(t, e, i, s, r) : this.right.lineAt(t, e, i, o, l);
    if (this.break || (a ? c.to < l : c.from > l))
      return c;
    let h = e == G.ByPosNoHeight ? G.ByPosNoHeight : G.ByPos;
    return a ? c.join(this.right.lineAt(l, h, i, o, l)) : this.left.lineAt(l, h, i, s, r).join(c);
  }
  forEachLine(t, e, i, s, r, o) {
    let l = s + this.left.height, a = r + this.left.length + this.break;
    if (this.break)
      t < a && this.left.forEachLine(t, e, i, s, r, o), e >= a && this.right.forEachLine(t, e, i, l, a, o);
    else {
      let c = this.lineAt(a, G.ByPos, i, s, r);
      t < c.from && this.left.forEachLine(t, c.from - 1, i, s, r, o), c.to >= t && c.from <= e && o(c), e > c.to && this.right.forEachLine(c.to + 1, e, i, l, a, o);
    }
  }
  replace(t, e, i) {
    let s = this.left.length + this.break;
    if (e < s)
      return this.balanced(this.left.replace(t, e, i), this.right);
    if (t > this.left.length)
      return this.balanced(this.left, this.right.replace(t - s, e - s, i));
    let r = [];
    t > 0 && this.decomposeLeft(t, r);
    let o = r.length;
    for (let l of i)
      r.push(l);
    if (t > 0 && Ko(r, o - 1), e < this.length) {
      let l = r.length;
      this.decomposeRight(e, r), Ko(r, l);
    }
    return yt.of(r);
  }
  decomposeLeft(t, e) {
    let i = this.left.length;
    if (t <= i)
      return this.left.decomposeLeft(t, e);
    e.push(this.left), this.break && (i++, t >= i && e.push(null)), t > i && this.right.decomposeLeft(t - i, e);
  }
  decomposeRight(t, e) {
    let i = this.left.length, s = i + this.break;
    if (t >= s)
      return this.right.decomposeRight(t - s, e);
    t < i && this.left.decomposeRight(t, e), this.break && t < s && e.push(null), e.push(this.right);
  }
  balanced(t, e) {
    return t.size > 2 * e.size || e.size > 2 * t.size ? yt.of(this.break ? [t, null, e] : [t, e]) : (this.left = Tn(this.left, t), this.right = Tn(this.right, e), this.setHeight(t.height + e.height), this.outdated = t.outdated || e.outdated, this.size = t.size + e.size, this.length = t.length + this.break + e.length, this);
  }
  updateHeight(t, e = 0, i = !1, s) {
    let { left: r, right: o } = this, l = e + r.length + this.break, a = null;
    return s && s.from <= e + r.length && s.more ? a = r = r.updateHeight(t, e, i, s) : r.updateHeight(t, e, i), s && s.from <= l + o.length && s.more ? a = o = o.updateHeight(t, l, i, s) : o.updateHeight(t, l, i), a ? this.balanced(r, o) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function Ko(n, t) {
  let e, i;
  n[t] == null && (e = n[t - 1]) instanceof nt && (i = n[t + 1]) instanceof nt && n.splice(t - 1, 3, new nt(e.length + 1 + i.length));
}
const uu = 5;
class Fr {
  constructor(t, e) {
    this.pos = t, this.oracle = e, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = t;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(t, e) {
    if (this.lineStart > -1) {
      let i = Math.min(e, this.lineEnd), s = this.nodes[this.nodes.length - 1];
      s instanceof Ct ? s.length += i - this.pos : (i > this.pos || !this.isCovered) && this.nodes.push(new Ct(i - this.pos, -1)), this.writtenTo = i, e > i && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = e;
  }
  point(t, e, i) {
    if (t < e || i.heightRelevant) {
      let s = i.widget ? i.widget.estimatedHeight : 0, r = i.widget ? i.widget.lineBreaks : 0;
      s < 0 && (s = this.oracle.lineHeight);
      let o = e - t;
      i.block ? this.addBlock(new th(o, s, i)) : (o || r || s >= uu) && this.addLineDeco(s, r, o);
    } else e > t && this.span(t, e);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: t, to: e } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = t, this.lineEnd = e, this.writtenTo < t && ((this.writtenTo < t - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, t - 1)), this.nodes.push(null)), this.pos > t && this.nodes.push(new Ct(this.pos - t, -1)), this.writtenTo = this.pos;
  }
  blankContent(t, e) {
    let i = new nt(e - t);
    return this.oracle.doc.lineAt(t).to == e && (i.flags |= 4), i;
  }
  ensureLine() {
    this.enterLine();
    let t = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (t instanceof Ct)
      return t;
    let e = new Ct(0, -1);
    return this.nodes.push(e), e;
  }
  addBlock(t) {
    this.enterLine();
    let e = t.deco;
    e && e.startSide > 0 && !this.isCovered && this.ensureLine(), this.nodes.push(t), this.writtenTo = this.pos = this.pos + t.length, e && e.endSide > 0 && (this.covering = t);
  }
  addLineDeco(t, e, i) {
    let s = this.ensureLine();
    s.length += i, s.collapsed += i, s.widgetHeight = Math.max(s.widgetHeight, t), s.breaks += e, this.writtenTo = this.pos = this.pos + i;
  }
  finish(t) {
    let e = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(e instanceof Ct) && !this.isCovered ? this.nodes.push(new Ct(0, -1)) : (this.writtenTo < this.pos || e == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let i = t;
    for (let s of this.nodes)
      s instanceof Ct && s.updateHeight(this.oracle, i), i += s ? s.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(t, e, i, s) {
    let r = new Fr(i, t);
    return H.spans(e, i, s, r, 0), r.finish(i);
  }
}
function du(n, t, e) {
  let i = new pu();
  return H.compare(n, t, e, i, 0), i.changes;
}
class pu {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(t, e, i, s) {
    (t < e || i && i.heightRelevant || s && s.heightRelevant) && Xs(t, e, this.changes, 5);
  }
}
function mu(n, t) {
  let e = n.getBoundingClientRect(), i = n.ownerDocument, s = i.defaultView || window, r = Math.max(0, e.left), o = Math.min(s.innerWidth, e.right), l = Math.max(0, e.top), a = Math.min(s.innerHeight, e.bottom);
  for (let c = n.parentNode; c && c != i.body; )
    if (c.nodeType == 1) {
      let h = c, f = window.getComputedStyle(h);
      if ((h.scrollHeight > h.clientHeight || h.scrollWidth > h.clientWidth) && f.overflow != "visible") {
        let u = h.getBoundingClientRect();
        r = Math.max(r, u.left), o = Math.min(o, u.right), l = Math.max(l, u.top), a = Math.min(c == n.parentNode ? s.innerHeight : a, u.bottom);
      }
      c = f.position == "absolute" || f.position == "fixed" ? h.offsetParent : h.parentNode;
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
  return {
    left: r - e.left,
    right: Math.max(r, o) - e.left,
    top: l - (e.top + t),
    bottom: Math.max(l, a) - (e.top + t)
  };
}
function gu(n, t) {
  let e = n.getBoundingClientRect();
  return {
    left: 0,
    right: e.right - e.left,
    top: t,
    bottom: e.bottom - (e.top + t)
  };
}
class ds {
  constructor(t, e, i, s) {
    this.from = t, this.to = e, this.size = i, this.displaySize = s;
  }
  static same(t, e) {
    if (t.length != e.length)
      return !1;
    for (let i = 0; i < t.length; i++) {
      let s = t[i], r = e[i];
      if (s.from != r.from || s.to != r.to || s.size != r.size)
        return !1;
    }
    return !0;
  }
  draw(t, e) {
    return B.replace({
      widget: new yu(this.displaySize * (e ? t.scaleY : t.scaleX), e)
    }).range(this.from, this.to);
  }
}
class yu extends ke {
  constructor(t, e) {
    super(), this.size = t, this.vertical = e;
  }
  eq(t) {
    return t.size == this.size && t.vertical == this.vertical;
  }
  toDOM() {
    let t = document.createElement("div");
    return this.vertical ? t.style.height = this.size + "px" : (t.style.width = this.size + "px", t.style.height = "2px", t.style.display = "inline-block"), t;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class jo {
  constructor(t) {
    this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scrollTop = 0, this.scrolledToBottom = !1, this.scaleX = 1, this.scaleY = 1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = Uo, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = Y.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let e = t.facet(Er).some((i) => typeof i != "function" && i.class == "cm-lineWrapping");
    this.heightOracle = new hu(e), this.stateDeco = t.facet(Di).filter((i) => typeof i != "function"), this.heightMap = yt.empty().applyChanges(this.stateDeco, V.empty, this.heightOracle.setDoc(t.doc), [new Rt(0, 0, 0, t.doc.length)]);
    for (let i = 0; i < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); i++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = B.set(this.lineGaps.map((i) => i.draw(this, !1))), this.computeVisibleRanges();
  }
  updateForViewport() {
    let t = [this.viewport], { main: e } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let s = i ? e.head : e.anchor;
      if (!t.some(({ from: r, to: o }) => s >= r && s <= o)) {
        let { from: r, to: o } = this.lineBlockAt(s);
        t.push(new Qi(r, o));
      }
    }
    return this.viewports = t.sort((i, s) => i.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let t = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? Uo : new Hr(this.heightOracle, this.heightMap, this.viewports), t.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (t) => {
      this.viewportLines.push(pi(t, this.scaler));
    });
  }
  update(t, e = null) {
    this.state = t.state;
    let i = this.stateDeco;
    this.stateDeco = this.state.facet(Di).filter((h) => typeof h != "function");
    let s = t.changedRanges, r = Rt.extendWithRanges(s, du(i, this.stateDeco, t ? t.changes : Z.empty(this.state.doc.length))), o = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollTop);
    $o(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, t.startState.doc, this.heightOracle.setDoc(this.state.doc), r), (this.heightMap.height != o || Qe) && (t.flags |= 2), l ? (this.scrollAnchorPos = t.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = this.heightMap.height);
    let a = r.length ? this.mapViewport(this.viewport, t.changes) : this.viewport;
    (e && (e.range.head < a.from || e.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, e));
    let c = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, t.flags |= this.updateForViewport(), (c || !t.changes.empty || t.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, t.changes))), t.flags |= this.computeVisibleRanges(), e && (this.scrollTarget = e), !this.mustEnforceCursorAssoc && t.selectionSet && t.view.lineWrapping && t.state.selection.main.empty && t.state.selection.main.assoc && !t.state.facet(Ia) && (this.mustEnforceCursorAssoc = !0);
  }
  measure(t) {
    let e = t.contentDOM, i = window.getComputedStyle(e), s = this.heightOracle, r = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? Y.RTL : Y.LTR;
    let o = this.heightOracle.mustRefreshForWrapping(r), l = e.getBoundingClientRect(), a = o || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let c = 0, h = 0;
    if (l.width && l.height) {
      let { scaleX: S, scaleY: v } = aa(e, l);
      (S > 5e-3 && Math.abs(this.scaleX - S) > 5e-3 || v > 5e-3 && Math.abs(this.scaleY - v) > 5e-3) && (this.scaleX = S, this.scaleY = v, c |= 8, o = a = !0);
    }
    let f = (parseInt(i.paddingTop) || 0) * this.scaleY, u = (parseInt(i.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != f || this.paddingBottom != u) && (this.paddingTop = f, this.paddingBottom = u, c |= 10), this.editorWidth != t.scrollDOM.clientWidth && (s.lineWrapping && (a = !0), this.editorWidth = t.scrollDOM.clientWidth, c |= 8);
    let d = t.scrollDOM.scrollTop * this.scaleY;
    this.scrollTop != d && (this.scrollAnchorHeight = -1, this.scrollTop = d), this.scrolledToBottom = fa(t.scrollDOM);
    let p = (this.printing ? gu : mu)(e, this.paddingTop), g = p.top - this.pixelViewport.top, y = p.bottom - this.pixelViewport.bottom;
    this.pixelViewport = p;
    let b = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (b != this.inView && (this.inView = b, b && (a = !0)), !this.inView && !this.scrollTarget)
      return 0;
    let w = l.width;
    if ((this.contentDOMWidth != w || this.editorHeight != t.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = t.scrollDOM.clientHeight, c |= 8), a) {
      let S = t.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(S) && (o = !0), o || s.lineWrapping && Math.abs(w - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: v, charWidth: C, textHeight: M } = t.docView.measureTextSize();
        o = v > 0 && s.refresh(r, v, C, M, w / C, S), o && (t.docView.minWidth = 0, c |= 8);
      }
      g > 0 && y > 0 ? h = Math.max(g, y) : g < 0 && y < 0 && (h = Math.min(g, y)), $o();
      for (let v of this.viewports) {
        let C = v.from == this.viewport.from ? S : t.docView.measureVisibleLineHeights(v);
        this.heightMap = (o ? yt.empty().applyChanges(this.stateDeco, V.empty, this.heightOracle, [new Rt(0, 0, 0, t.state.doc.length)]) : this.heightMap).updateHeight(s, 0, o, new cu(v.from, C));
      }
      Qe && (c |= 2);
    }
    let k = !this.viewportIsAppropriate(this.viewport, h) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return k && (c & 2 && (c |= this.updateScaler()), this.viewport = this.getViewport(h, this.scrollTarget), c |= this.updateForViewport()), (c & 2 || k) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(o ? [] : this.lineGaps, t)), c |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, t.docView.enforceCursorAssoc()), c;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(t, e) {
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, t / 1e3 / 2)), s = this.heightMap, r = this.heightOracle, { visibleTop: o, visibleBottom: l } = this, a = new Qi(s.lineAt(o - i * 1e3, G.ByHeight, r, 0, 0).from, s.lineAt(l + (1 - i) * 1e3, G.ByHeight, r, 0, 0).to);
    if (e) {
      let { head: c } = e.range;
      if (c < a.from || c > a.to) {
        let h = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), f = s.lineAt(c, G.ByPos, r, 0, 0), u;
        e.y == "center" ? u = (f.top + f.bottom) / 2 - h / 2 : e.y == "start" || e.y == "nearest" && c < a.from ? u = f.top : u = f.bottom - h, a = new Qi(s.lineAt(u - 1e3 / 2, G.ByHeight, r, 0, 0).from, s.lineAt(u + h + 1e3 / 2, G.ByHeight, r, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(t, e) {
    let i = e.mapPos(t.from, -1), s = e.mapPos(t.to, 1);
    return new Qi(this.heightMap.lineAt(i, G.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, G.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: t, to: e }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: s } = this.heightMap.lineAt(t, G.ByPos, this.heightOracle, 0, 0), { bottom: r } = this.heightMap.lineAt(e, G.ByPos, this.heightOracle, 0, 0), { visibleTop: o, visibleBottom: l } = this;
    return (t == 0 || s <= o - Math.max(10, Math.min(
      -i,
      250
      /* VP.MaxCoverMargin */
    ))) && (e == this.state.doc.length || r >= l + Math.max(10, Math.min(
      i,
      250
      /* VP.MaxCoverMargin */
    ))) && s > o - 2 * 1e3 && r < l + 2 * 1e3;
  }
  mapLineGaps(t, e) {
    if (!t.length || e.empty)
      return t;
    let i = [];
    for (let s of t)
      e.touchesRange(s.from, s.to) || i.push(new ds(e.mapPos(s.from), e.mapPos(s.to), s.size, s.displaySize));
    return i;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(t, e) {
    let i = this.heightOracle.lineWrapping, s = i ? 1e4 : 2e3, r = s >> 1, o = s << 1;
    if (this.defaultTextDirection != Y.LTR && !i)
      return [];
    let l = [], a = (h, f, u, d) => {
      if (f - h < r)
        return;
      let p = this.state.selection.main, g = [p.from];
      p.empty || g.push(p.to);
      for (let b of g)
        if (b > h && b < f) {
          a(h, b - 10, u, d), a(b + 10, f, u, d);
          return;
        }
      let y = xu(t, (b) => b.from >= u.from && b.to <= u.to && Math.abs(b.from - h) < r && Math.abs(b.to - f) < r && !g.some((w) => b.from < w && b.to > w));
      if (!y) {
        if (f < u.to && e && i && e.visibleRanges.some((k) => k.from <= f && k.to >= f)) {
          let k = e.moveToLineBoundary(x.cursor(f), !1, !0).head;
          k > h && (f = k);
        }
        let b = this.gapSize(u, h, f, d), w = i || b < 2e6 ? b : 2e6;
        y = new ds(h, f, b, w);
      }
      l.push(y);
    }, c = (h) => {
      if (h.length < o || h.type != gt.Text)
        return;
      let f = bu(h.from, h.to, this.stateDeco);
      if (f.total < o)
        return;
      let u = this.scrollTarget ? this.scrollTarget.range.head : null, d, p;
      if (i) {
        let g = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, y, b;
        if (u != null) {
          let w = tn(f, u), k = ((this.visibleBottom - this.visibleTop) / 2 + g) / h.height;
          y = w - k, b = w + k;
        } else
          y = (this.visibleTop - h.top - g) / h.height, b = (this.visibleBottom - h.top + g) / h.height;
        d = Zi(f, y), p = Zi(f, b);
      } else {
        let g = f.total * this.heightOracle.charWidth, y = s * this.heightOracle.charWidth, b = 0;
        if (g > 2e6)
          for (let C of t)
            C.from >= h.from && C.from < h.to && C.size != C.displaySize && C.from * this.heightOracle.charWidth + b < this.pixelViewport.left && (b = C.size - C.displaySize);
        let w = this.pixelViewport.left + b, k = this.pixelViewport.right + b, S, v;
        if (u != null) {
          let C = tn(f, u), M = ((k - w) / 2 + y) / g;
          S = C - M, v = C + M;
        } else
          S = (w - y) / g, v = (k + y) / g;
        d = Zi(f, S), p = Zi(f, v);
      }
      d > h.from && a(h.from, d, h, f), p < h.to && a(p, h.to, h, f);
    };
    for (let h of this.viewportLines)
      Array.isArray(h.type) ? h.type.forEach(c) : c(h);
    return l;
  }
  gapSize(t, e, i, s) {
    let r = tn(s, i) - tn(s, e);
    return this.heightOracle.lineWrapping ? t.height * r : s.total * this.heightOracle.charWidth * r;
  }
  updateLineGaps(t) {
    ds.same(t, this.lineGaps) || (this.lineGaps = t, this.lineGapDeco = B.set(t.map((e) => e.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges() {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let e = [];
    H.spans(t, this.viewport.from, this.viewport.to, {
      span(s, r) {
        e.push({ from: s, to: r });
      },
      point() {
      }
    }, 20);
    let i = e.length != this.visibleRanges.length || this.visibleRanges.some((s, r) => s.from != e[r].from || s.to != e[r].to);
    return this.visibleRanges = e, i ? 4 : 0;
  }
  lineBlockAt(t) {
    return t >= this.viewport.from && t <= this.viewport.to && this.viewportLines.find((e) => e.from <= t && e.to >= t) || pi(this.heightMap.lineAt(t, G.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(t) {
    return t >= this.viewportLines[0].top && t <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((e) => e.top <= t && e.bottom >= t) || pi(this.heightMap.lineAt(this.scaler.fromDOM(t), G.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  scrollAnchorAt(t) {
    let e = this.lineBlockAtHeight(t + 8);
    return e.from >= this.viewport.from || this.viewportLines[0].top - t > 200 ? e : this.viewportLines[0];
  }
  elementAtHeight(t) {
    return pi(this.heightMap.blockAt(this.scaler.fromDOM(t), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class Qi {
  constructor(t, e) {
    this.from = t, this.to = e;
  }
}
function bu(n, t, e) {
  let i = [], s = n, r = 0;
  return H.spans(e, n, t, {
    span() {
    },
    point(o, l) {
      o > s && (i.push({ from: s, to: o }), r += o - s), s = l;
    }
  }, 20), s < t && (i.push({ from: s, to: t }), r += t - s), { total: r, ranges: i };
}
function Zi({ total: n, ranges: t }, e) {
  if (e <= 0)
    return t[0].from;
  if (e >= 1)
    return t[t.length - 1].to;
  let i = Math.floor(n * e);
  for (let s = 0; ; s++) {
    let { from: r, to: o } = t[s], l = o - r;
    if (i <= l)
      return r + i;
    i -= l;
  }
}
function tn(n, t) {
  let e = 0;
  for (let { from: i, to: s } of n.ranges) {
    if (t <= s) {
      e += t - i;
      break;
    }
    e += s - i;
  }
  return e / n.total;
}
function xu(n, t) {
  for (let e of n)
    if (t(e))
      return e;
}
const Uo = {
  toDOM(n) {
    return n;
  },
  fromDOM(n) {
    return n;
  },
  scale: 1,
  eq(n) {
    return n == this;
  }
};
class Hr {
  constructor(t, e, i) {
    let s = 0, r = 0, o = 0;
    this.viewports = i.map(({ from: l, to: a }) => {
      let c = e.lineAt(l, G.ByPos, t, 0, 0).top, h = e.lineAt(a, G.ByPos, t, 0, 0).bottom;
      return s += h - c, { from: l, to: a, top: c, bottom: h, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - s) / (e.height - s);
    for (let l of this.viewports)
      l.domTop = o + (l.top - r) * this.scale, o = l.domBottom = l.domTop + (l.bottom - l.top), r = l.bottom;
  }
  toDOM(t) {
    for (let e = 0, i = 0, s = 0; ; e++) {
      let r = e < this.viewports.length ? this.viewports[e] : null;
      if (!r || t < r.top)
        return s + (t - i) * this.scale;
      if (t <= r.bottom)
        return r.domTop + (t - r.top);
      i = r.bottom, s = r.domBottom;
    }
  }
  fromDOM(t) {
    for (let e = 0, i = 0, s = 0; ; e++) {
      let r = e < this.viewports.length ? this.viewports[e] : null;
      if (!r || t < r.domTop)
        return i + (t - s) / this.scale;
      if (t <= r.domBottom)
        return r.top + (t - r.domTop);
      i = r.bottom, s = r.domBottom;
    }
  }
  eq(t) {
    return t instanceof Hr ? this.scale == t.scale && this.viewports.length == t.viewports.length && this.viewports.every((e, i) => e.from == t.viewports[i].from && e.to == t.viewports[i].to) : !1;
  }
}
function pi(n, t) {
  if (t.scale == 1)
    return n;
  let e = t.toDOM(n.top), i = t.toDOM(n.bottom);
  return new Gt(n.from, n.length, e, i - e, Array.isArray(n._content) ? n._content.map((s) => pi(s, t)) : n._content);
}
const en = /* @__PURE__ */ O.define({ combine: (n) => n.join(" ") }), or = /* @__PURE__ */ O.define({ combine: (n) => n.indexOf(!0) > -1 }), lr = /* @__PURE__ */ ye.newName(), eh = /* @__PURE__ */ ye.newName(), ih = /* @__PURE__ */ ye.newName(), nh = { "&light": "." + eh, "&dark": "." + ih };
function ar(n, t, e) {
  return new ye(t, {
    finish(i) {
      return /&/.test(i) ? i.replace(/&\w*/, (s) => {
        if (s == "&")
          return n;
        if (!e || !e[s])
          throw new RangeError(`Unsupported selector: ${s}`);
        return e[s];
      }) : n + " " + i;
    }
  });
}
const wu = /* @__PURE__ */ ar("." + lr, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0,
    overflowAnchor: "none"
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    // https://github.com/codemirror/dev/issues/456
    boxSizing: "border-box",
    minHeight: "100%",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    // For IE
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    // For Safari, which doesn't support overflow-wrap: anywhere
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#444"
  },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  ".cm-iso": {
    unicodeBidi: "isolate"
  },
  ".cm-announced": {
    position: "fixed",
    top: "-10000px"
  },
  "@media print": {
    ".cm-announced": { display: "none" }
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    insetInlineStart: 0,
    zIndex: 200
  },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    borderRight: "1px solid #ddd"
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    // Necessary -- prevents margin collapsing
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0,
    zIndex: 300
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top"
  },
  ".cm-highlightSpace": {
    backgroundImage: "radial-gradient(circle at 50% 55%, #aaa 20%, transparent 5%)",
    backgroundPosition: "center"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, nh), vu = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, ps = T.ie && T.ie_version <= 11;
class ku {
  constructor(t) {
    this.view = t, this.active = !1, this.editContext = null, this.selectionRange = new of(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = t.contentDOM, this.observer = new MutationObserver((e) => {
      for (let i of e)
        this.queue.push(i);
      (T.ie && T.ie_version <= 11 || T.ios && t.composing) && e.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && t.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(T.chrome && T.chrome_version < 126) && (this.editContext = new Cu(t), t.state.facet(ae) && (t.contentDOM.editContext = this.editContext.editContext)), ps && (this.onCharData = (e) => {
      this.queue.push({
        target: e.target,
        type: "characterData",
        oldValue: e.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), this.onResize = this.onResize.bind(this), this.onPrint = this.onPrint.bind(this), this.onScroll = this.onScroll.bind(this), window.matchMedia && (this.printQuery = window.matchMedia("print")), typeof ResizeObserver == "function" && (this.resizeScroll = new ResizeObserver(() => {
      var e;
      ((e = this.view.docView) === null || e === void 0 ? void 0 : e.lastUpdate) < Date.now() - 75 && this.onResize();
    }), this.resizeScroll.observe(t.scrollDOM)), this.addWindowListeners(this.win = t.win), this.start(), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((e) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), e.length > 0 && e[e.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, { threshold: [0, 1e-3] }), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((e) => {
      e.length > 0 && e[e.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
    }, {})), this.listenForScroll(), this.readSelectionRange();
  }
  onScrollChanged(t) {
    this.view.inputState.runHandlers("scroll", t), this.intersecting && this.view.measure();
  }
  onScroll(t) {
    this.intersecting && this.flush(!1), this.editContext && this.view.requestMeasure(this.editContext.measureReq), this.onScrollChanged(t);
  }
  onResize() {
    this.resizeTimeout < 0 && (this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = -1, this.view.requestMeasure();
    }, 50));
  }
  onPrint(t) {
    (t.type == "change" || !t.type) && !t.matches || (this.view.viewState.printing = !0, this.view.measure(), setTimeout(() => {
      this.view.viewState.printing = !1, this.view.requestMeasure();
    }, 500));
  }
  updateGaps(t) {
    if (this.gapIntersection && (t.length != this.gaps.length || this.gaps.some((e, i) => e != t[i]))) {
      this.gapIntersection.disconnect();
      for (let e of t)
        this.gapIntersection.observe(e);
      this.gaps = t;
    }
  }
  onSelectionChange(t) {
    let e = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view: i } = this, s = this.selectionRange;
    if (i.state.facet(ae) ? i.root.activeElement != this.dom : !yn(this.dom, s))
      return;
    let r = s.anchorNode && i.docView.nearest(s.anchorNode);
    if (r && r.ignoreEvent(t)) {
      e || (this.selectionChanged = !1);
      return;
    }
    (T.ie && T.ie_version <= 11 || T.android && T.chrome) && !i.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && xi(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: t } = this, e = Ai(t.root);
    if (!e)
      return !1;
    let i = T.safari && t.root.nodeType == 11 && t.root.activeElement == this.dom && Su(this.view, e) || e;
    if (!i || this.selectionRange.eq(i))
      return !1;
    let s = yn(this.dom, i);
    return s && !this.selectionChanged && t.inputState.lastFocusTime > Date.now() - 200 && t.inputState.lastTouchTime < Date.now() - 300 && af(this.dom, i) ? (this.view.inputState.lastFocusTime = 0, t.docView.updateSelection(), !1) : (this.selectionRange.setRange(i), s && (this.selectionChanged = !0), !0);
  }
  setSelectionRange(t, e) {
    this.selectionRange.set(t.node, t.offset, e.node, e.offset), this.selectionChanged = !1;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let t = 0, e = null;
    for (let i = this.dom; i; )
      if (i.nodeType == 1)
        !e && t < this.scrollTargets.length && this.scrollTargets[t] == i ? t++ : e || (e = this.scrollTargets.slice(0, t)), e && e.push(i), i = i.assignedSlot || i.parentNode;
      else if (i.nodeType == 11)
        i = i.host;
      else
        break;
    if (t < this.scrollTargets.length && !e && (e = this.scrollTargets.slice(0, t)), e) {
      for (let i of this.scrollTargets)
        i.removeEventListener("scroll", this.onScroll);
      for (let i of this.scrollTargets = e)
        i.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(t) {
    if (!this.active)
      return t();
    try {
      return this.stop(), t();
    } finally {
      this.start(), this.clear();
    }
  }
  start() {
    this.active || (this.observer.observe(this.dom, vu), ps && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), ps && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  // Throw away any pending changes
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(t, e) {
    var i;
    if (!this.delayedAndroidKey) {
      let s = () => {
        let r = this.delayedAndroidKey;
        r && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = r.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && r.force && je(this.dom, r.key, r.keyCode));
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(s);
    }
    (!this.delayedAndroidKey || t == "Enter") && (this.delayedAndroidKey = {
      key: t,
      keyCode: e,
      // Only run the key handler when no changes are detected if
      // this isn't coming right after another change, in which case
      // it is probably part of a weird chain of updates, and should
      // be ignored if it returns the DOM to its previous state.
      force: this.lastChange < Date.now() - 50 || !!(!((i = this.delayedAndroidKey) === null || i === void 0) && i.force)
    });
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey), this.delayedAndroidKey = null, this.flushingAndroidKey = -1;
  }
  flushSoon() {
    this.delayedFlush < 0 && (this.delayedFlush = this.view.win.requestAnimationFrame(() => {
      this.delayedFlush = -1, this.flush();
    }));
  }
  forceFlush() {
    this.delayedFlush >= 0 && (this.view.win.cancelAnimationFrame(this.delayedFlush), this.delayedFlush = -1), this.flush();
  }
  pendingRecords() {
    for (let t of this.observer.takeRecords())
      this.queue.push(t);
    return this.queue;
  }
  processRecords() {
    let t = this.pendingRecords();
    t.length && (this.queue = []);
    let e = -1, i = -1, s = !1;
    for (let r of t) {
      let o = this.readMutation(r);
      o && (o.typeOver && (s = !0), e == -1 ? { from: e, to: i } = o : (e = Math.min(o.from, e), i = Math.max(o.to, i)));
    }
    return { from: e, to: i, typeOver: s };
  }
  readChange() {
    let { from: t, to: e, typeOver: i } = this.processRecords(), s = this.selectionChanged && yn(this.dom, this.selectionRange);
    if (t < 0 && !s)
      return null;
    t > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let r = new zf(this.view, t, e, i);
    return this.view.docView.domChanged = { newSel: r.newSel ? r.newSel.main : null }, r;
  }
  // Apply pending changes, if any
  flush(t = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return !1;
    t && this.readSelectionRange();
    let e = this.readChange();
    if (!e)
      return this.view.requestMeasure(), !1;
    let i = this.view.state, s = ja(this.view, e);
    return this.view.state == i && (e.domChanged || e.newSel && !e.newSel.main.eq(this.view.state.selection.main)) && this.view.update([]), s;
  }
  readMutation(t) {
    let e = this.view.docView.nearest(t.target);
    if (!e || e.ignoreMutation(t))
      return null;
    if (e.markDirty(t.type == "attributes"), t.type == "attributes" && (e.flags |= 4), t.type == "childList") {
      let i = Go(e, t.previousSibling || t.target.previousSibling, -1), s = Go(e, t.nextSibling || t.target.nextSibling, 1);
      return {
        from: i ? e.posAfter(i) : e.posAtStart,
        to: s ? e.posBefore(s) : e.posAtEnd,
        typeOver: !1
      };
    } else return t.type == "characterData" ? { from: e.posAtStart, to: e.posAtEnd, typeOver: t.target.nodeValue == t.oldValue } : null;
  }
  setWindow(t) {
    t != this.win && (this.removeWindowListeners(this.win), this.win = t, this.addWindowListeners(this.win));
  }
  addWindowListeners(t) {
    t.addEventListener("resize", this.onResize), this.printQuery ? this.printQuery.addEventListener ? this.printQuery.addEventListener("change", this.onPrint) : this.printQuery.addListener(this.onPrint) : t.addEventListener("beforeprint", this.onPrint), t.addEventListener("scroll", this.onScroll), t.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(t) {
    t.removeEventListener("scroll", this.onScroll), t.removeEventListener("resize", this.onResize), this.printQuery ? this.printQuery.removeEventListener ? this.printQuery.removeEventListener("change", this.onPrint) : this.printQuery.removeListener(this.onPrint) : t.removeEventListener("beforeprint", this.onPrint), t.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  update(t) {
    this.editContext && (this.editContext.update(t), t.startState.facet(ae) != t.state.facet(ae) && (t.view.contentDOM.editContext = t.state.facet(ae) ? this.editContext.editContext : null));
  }
  destroy() {
    var t, e, i;
    this.stop(), (t = this.intersection) === null || t === void 0 || t.disconnect(), (e = this.gapIntersection) === null || e === void 0 || e.disconnect(), (i = this.resizeScroll) === null || i === void 0 || i.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function Go(n, t, e) {
  for (; t; ) {
    let i = K.get(t);
    if (i && i.parent == n)
      return i;
    let s = t.parentNode;
    t = s != n.dom ? s : e > 0 ? t.nextSibling : t.previousSibling;
  }
  return null;
}
function Yo(n, t) {
  let e = t.startContainer, i = t.startOffset, s = t.endContainer, r = t.endOffset, o = n.docView.domAtPos(n.state.selection.main.anchor);
  return xi(o.node, o.offset, s, r) && ([e, i, s, r] = [s, r, e, i]), { anchorNode: e, anchorOffset: i, focusNode: s, focusOffset: r };
}
function Su(n, t) {
  if (t.getComposedRanges) {
    let s = t.getComposedRanges(n.root)[0];
    if (s)
      return Yo(n, s);
  }
  let e = null;
  function i(s) {
    s.preventDefault(), s.stopImmediatePropagation(), e = s.getTargetRanges()[0];
  }
  return n.contentDOM.addEventListener("beforeinput", i, !0), n.dom.ownerDocument.execCommand("indent"), n.contentDOM.removeEventListener("beforeinput", i, !0), e ? Yo(n, e) : null;
}
class Cu {
  constructor(t) {
    this.from = 0, this.to = 0, this.pendingContextChange = null, this.handlers = /* @__PURE__ */ Object.create(null), this.resetRange(t.state);
    let e = this.editContext = new window.EditContext({
      text: t.state.doc.sliceString(this.from, this.to),
      selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, t.state.selection.main.anchor))),
      selectionEnd: this.toContextPos(t.state.selection.main.head)
    });
    this.handlers.textupdate = (i) => {
      let { anchor: s } = t.state.selection.main, r = {
        from: this.toEditorPos(i.updateRangeStart),
        to: this.toEditorPos(i.updateRangeEnd),
        insert: V.of(i.text.split(`
`))
      };
      r.from == this.from && s < this.from ? r.from = s : r.to == this.to && s > this.to && (r.to = s), !(r.from == r.to && !r.insert.length) && (this.pendingContextChange = r, t.state.readOnly || Nr(t, r, x.single(this.toEditorPos(i.selectionStart), this.toEditorPos(i.selectionEnd))), this.pendingContextChange && (this.revertPending(t.state), this.setSelection(t.state)));
    }, this.handlers.characterboundsupdate = (i) => {
      let s = [], r = null;
      for (let o = this.toEditorPos(i.rangeStart), l = this.toEditorPos(i.rangeEnd); o < l; o++) {
        let a = t.coordsForChar(o);
        r = a && new DOMRect(a.left, a.top, a.right - a.left, a.bottom - a.top) || r || new DOMRect(), s.push(r);
      }
      e.updateCharacterBounds(i.rangeStart, s);
    }, this.handlers.textformatupdate = (i) => {
      let s = [];
      for (let r of i.getTextFormats()) {
        let o = r.underlineStyle, l = r.underlineThickness;
        if (o != "None" && l != "None") {
          let a = `text-decoration: underline ${o == "Dashed" ? "dashed " : o == "Squiggle" ? "wavy " : ""}${l == "Thin" ? 1 : 2}px`;
          s.push(B.mark({ attributes: { style: a } }).range(this.toEditorPos(r.rangeStart), this.toEditorPos(r.rangeEnd)));
        }
      }
      t.dispatch({ effects: Fa.of(B.set(s)) });
    }, this.handlers.compositionstart = () => {
      t.inputState.composing < 0 && (t.inputState.composing = 0, t.inputState.compositionFirstChange = !0);
    }, this.handlers.compositionend = () => {
      t.inputState.composing = -1, t.inputState.compositionFirstChange = null;
    };
    for (let i in this.handlers)
      e.addEventListener(i, this.handlers[i]);
    this.measureReq = { read: (i) => {
      this.editContext.updateControlBounds(i.contentDOM.getBoundingClientRect());
      let s = Ai(i.root);
      s && s.rangeCount && this.editContext.updateSelectionBounds(s.getRangeAt(0).getBoundingClientRect());
    } };
  }
  applyEdits(t) {
    let e = 0, i = !1, s = this.pendingContextChange;
    return t.changes.iterChanges((r, o, l, a, c) => {
      if (i)
        return;
      let h = c.length - (o - r);
      if (s && o >= s.to)
        if (s.from == r && s.to == o && s.insert.eq(c)) {
          s = this.pendingContextChange = null, e += h, this.to += h;
          return;
        } else
          s = null, this.revertPending(t.state);
      if (r += e, o += e, o <= this.from)
        this.from += h, this.to += h;
      else if (r < this.to) {
        if (r < this.from || o > this.to || this.to - this.from + c.length > 3e4) {
          i = !0;
          return;
        }
        this.editContext.updateText(this.toContextPos(r), this.toContextPos(o), c.toString()), this.to += h;
      }
      e += h;
    }), s && !i && this.revertPending(t.state), !i;
  }
  update(t) {
    let e = this.pendingContextChange;
    !this.applyEdits(t) || !this.rangeIsValid(t.state) ? (this.pendingContextChange = null, this.resetRange(t.state), this.editContext.updateText(0, this.editContext.text.length, t.state.doc.sliceString(this.from, this.to)), this.setSelection(t.state)) : (t.docChanged || t.selectionSet || e) && this.setSelection(t.state), (t.geometryChanged || t.docChanged || t.selectionSet) && t.view.requestMeasure(this.measureReq);
  }
  resetRange(t) {
    let { head: e } = t.selection.main;
    this.from = Math.max(
      0,
      e - 1e4
      /* CxVp.Margin */
    ), this.to = Math.min(
      t.doc.length,
      e + 1e4
      /* CxVp.Margin */
    );
  }
  revertPending(t) {
    let e = this.pendingContextChange;
    this.pendingContextChange = null, this.editContext.updateText(this.toContextPos(e.from), this.toContextPos(e.from + e.insert.length), t.doc.sliceString(e.from, e.to));
  }
  setSelection(t) {
    let { main: e } = t.selection, i = this.toContextPos(Math.max(this.from, Math.min(this.to, e.anchor))), s = this.toContextPos(e.head);
    (this.editContext.selectionStart != i || this.editContext.selectionEnd != s) && this.editContext.updateSelection(i, s);
  }
  rangeIsValid(t) {
    let { head: e } = t.selection.main;
    return !(this.from > 0 && e - this.from < 500 || this.to < t.doc.length && this.to - e < 500 || this.to - this.from > 1e4 * 3);
  }
  toEditorPos(t) {
    return t + this.from;
  }
  toContextPos(t) {
    return t - this.from;
  }
  destroy() {
    for (let t in this.handlers)
      this.editContext.removeEventListener(t, this.handlers[t]);
  }
}
class D {
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(t = {}) {
    var e;
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.className = "cm-announced", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM), t.parent && t.parent.appendChild(this.dom);
    let { dispatch: i } = t;
    this.dispatchTransactions = t.dispatchTransactions || i && ((s) => s.forEach((r) => i(r, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = t.root || lf(t.parent) || document, this.viewState = new jo(t.state || F.create(t)), t.scrollTo && t.scrollTo.is(_i) && (this.viewState.scrollTarget = t.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(fi).map((s) => new cs(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new ku(this), this.inputState = new Uf(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Mo(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((e = document.fonts) === null || e === void 0) && e.ready && document.fonts.ready.then(() => this.requestMeasure());
  }
  dispatch(...t) {
    let e = t.length == 1 && t[0] instanceof tt ? t : t.length == 1 && Array.isArray(t[0]) ? t[0] : [this.state.update(...t)];
    this.dispatchTransactions(e, this);
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(t) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let e = !1, i = !1, s, r = this.state;
    for (let u of t) {
      if (u.startState != r)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      r = u.state;
    }
    if (this.destroyed) {
      this.viewState.state = r;
      return;
    }
    let o = this.hasFocus, l = 0, a = null;
    t.some((u) => u.annotation(Xa)) ? (this.inputState.notifiedFocused = o, l = 1) : o != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = o, a = Qa(r, o), a || (l = 1));
    let c = this.observer.delayedAndroidKey, h = null;
    if (c ? (this.observer.clearDelayedAndroidKey(), h = this.observer.readChange(), (h && !this.state.doc.eq(r.doc) || !this.state.selection.eq(r.selection)) && (h = null)) : this.observer.clear(), r.facet(F.phrases) != this.state.facet(F.phrases))
      return this.setState(r);
    s = On.create(this, r, t), s.flags |= l;
    let f = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let u of t) {
        if (f && (f = f.map(u.changes)), u.scrollIntoView) {
          let { main: d } = u.state.selection;
          f = new Ue(d.empty ? d : x.cursor(d.head, d.head > d.anchor ? -1 : 1));
        }
        for (let d of u.effects)
          d.is(_i) && (f = d.value.clip(this.state));
      }
      this.viewState.update(s, f), this.bidiCache = Bn.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), e = this.docView.update(s), this.state.facet(ui) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(t), this.docView.updateSelection(e, t.some((u) => u.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(en) != s.state.facet(en) && (this.viewState.mustMeasureContent = !0), (e || i || f || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), e && this.docViewUpdate(), !s.empty)
      for (let u of this.state.facet(ir))
        try {
          u(s);
        } catch (d) {
          wt(this.state, d, "update listener");
        }
    (a || h) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), h && !ja(this, h) && c.force && je(this.contentDOM, c.key, c.keyCode);
    });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(t) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = t;
      return;
    }
    this.updateState = 2;
    let e = this.hasFocus;
    try {
      for (let i of this.plugins)
        i.destroy(this);
      this.viewState = new jo(t), this.plugins = t.facet(fi).map((i) => new cs(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView.destroy(), this.docView = new Mo(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    e && this.focus(), this.requestMeasure();
  }
  updatePlugins(t) {
    let e = t.startState.facet(fi), i = t.state.facet(fi);
    if (e != i) {
      let s = [];
      for (let r of i) {
        let o = e.indexOf(r);
        if (o < 0)
          s.push(new cs(r));
        else {
          let l = this.plugins[o];
          l.mustUpdate = t, s.push(l);
        }
      }
      for (let r of this.plugins)
        r.mustUpdate != t && r.destroy(this);
      this.plugins = s, this.pluginMap.clear();
    } else
      for (let s of this.plugins)
        s.mustUpdate = t;
    for (let s = 0; s < this.plugins.length; s++)
      this.plugins[s].update(this);
    e != i && this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let t of this.plugins) {
      let e = t.value;
      if (e && e.docViewUpdate)
        try {
          e.docViewUpdate(this);
        } catch (i) {
          wt(this.state, i, "doc view update listener");
        }
    }
  }
  /**
  @internal
  */
  measure(t = !0) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.observer.delayedAndroidKey) {
      this.measureScheduled = -1, this.requestMeasure();
      return;
    }
    this.measureScheduled = 0, t && this.observer.forceFlush();
    let e = null, i = this.scrollDOM, s = i.scrollTop * this.scaleY, { scrollAnchorPos: r, scrollAnchorHeight: o } = this.viewState;
    Math.abs(s - this.viewState.scrollTop) > 1 && (o = -1), this.viewState.scrollAnchorHeight = -1;
    try {
      for (let l = 0; ; l++) {
        if (o < 0)
          if (fa(i))
            r = -1, o = this.viewState.heightMap.height;
          else {
            let d = this.viewState.scrollAnchorAt(s);
            r = d.from, o = d.top;
          }
        this.updateState = 1;
        let a = this.viewState.measure(this);
        if (!a && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (l > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let c = [];
        a & 4 || ([this.measureRequests, c] = [c, this.measureRequests]);
        let h = c.map((d) => {
          try {
            return d.read(this);
          } catch (p) {
            return wt(this.state, p), _o;
          }
        }), f = On.create(this, this.state, []), u = !1;
        f.flags |= a, e ? e.flags |= a : e = f, this.updateState = 2, f.empty || (this.updatePlugins(f), this.inputState.update(f), this.updateAttrs(), u = this.docView.update(f), u && this.docViewUpdate());
        for (let d = 0; d < c.length; d++)
          if (h[d] != _o)
            try {
              let p = c[d];
              p.write && p.write(h[d], this);
            } catch (p) {
              wt(this.state, p);
            }
        if (u && this.docView.updateSelection(!0), !f.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, o = -1;
              continue;
            } else {
              let p = (r < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(r).top) - o;
              if (p > 1 || p < -1) {
                s = s + p, i.scrollTop = s / this.scaleY, o = -1;
                continue;
              }
            }
          break;
        }
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (e && !e.empty)
      for (let l of this.state.facet(ir))
        l(e);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return lr + " " + (this.state.facet(or) ? ih : eh) + " " + this.state.facet(en);
  }
  updateAttrs() {
    let t = Jo(this, Ha, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), e = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      translate: "no",
      contenteditable: this.state.facet(ae) ? "true" : "false",
      class: "cm-content",
      style: `${T.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (e["aria-readonly"] = "true"), Jo(this, Er, e);
    let i = this.observer.ignore(() => {
      let s = Js(this.contentDOM, this.contentAttrs, e), r = Js(this.dom, this.editorAttrs, t);
      return s || r;
    });
    return this.editorAttrs = t, this.contentAttrs = e, i;
  }
  showAnnouncements(t) {
    let e = !0;
    for (let i of t)
      for (let s of i.effects)
        if (s.is(D.announce)) {
          e && (this.announceDOM.textContent = ""), e = !1;
          let r = this.announceDOM.appendChild(document.createElement("div"));
          r.textContent = s.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(ui);
    let t = this.state.facet(D.cspNonce);
    ye.mount(this.root, this.styleModules.concat(wu).reverse(), t ? { nonce: t } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    this.updateState == 0 && this.measureScheduled > -1 && this.measure(!1);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(t) {
    if (this.measureScheduled < 0 && (this.measureScheduled = this.win.requestAnimationFrame(() => this.measure())), t) {
      if (this.measureRequests.indexOf(t) > -1)
        return;
      if (t.key != null) {
        for (let e = 0; e < this.measureRequests.length; e++)
          if (this.measureRequests[e].key === t.key) {
            this.measureRequests[e] = t;
            return;
          }
      }
      this.measureRequests.push(t);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(t) {
    let e = this.pluginMap.get(t);
    return (e === void 0 || e && e.spec != t) && this.pluginMap.set(t, e = this.plugins.find((i) => i.spec == t) || null), e && e.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  If the editor is transformed with CSS, this provides the scale
  along the X axis. Otherwise, it will just be 1. Note that
  transforms other than translation and scaling are not supported.
  */
  get scaleX() {
    return this.viewState.scaleX;
  }
  /**
  Provide the CSS transformed scale along the Y axis.
  */
  get scaleY() {
    return this.viewState.scaleY;
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(t) {
    return this.readMeasured(), this.viewState.elementAtHeight(t);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(t) {
    return this.readMeasured(), this.viewState.lineBlockAtHeight(t);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line break, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(t) {
    return this.viewState.lineBlockAt(t);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(t, e, i) {
    return us(this, t, Lo(this, t, e, i));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(t, e) {
    return us(this, t, Lo(this, t, e, (i) => Ff(this, t.head, i)));
  }
  /**
  Get the cursor position visually at the start or end of a line.
  Note that this may differ from the _logical_ position at its
  start or end (which is simply at `line.from`/`line.to`) if text
  at the start or end goes against the line's base text direction.
  */
  visualLineSide(t, e) {
    let i = this.bidiSpans(t), s = this.textDirectionAt(t.from), r = i[e ? i.length - 1 : 0];
    return x.cursor(r.side(e, s) + t.from, r.forward(!e, s) ? 1 : -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(t, e, i = !0) {
    return Nf(this, t, e, i);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(t, e, i) {
    return us(this, t, Hf(this, t, e, i));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(t) {
    return this.docView.domAtPos(t);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(t, e = 0) {
    return this.docView.posFromDOM(t, e);
  }
  posAtCoords(t, e = !0) {
    return this.readMeasured(), Ka(this, t, e);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(t, e = 1) {
    this.readMeasured();
    let i = this.docView.coordsAt(t, e);
    if (!i || i.left == i.right)
      return i;
    let s = this.state.doc.lineAt(t), r = this.bidiSpans(s), o = r[ue.find(r, t - s.from, -1, e)];
    return Jn(i, o.dir == Y.LTR == e > 0);
  }
  /**
  Return the rectangle around a given character. If `pos` does not
  point in front of a character that is in the viewport and
  rendered (i.e. not replaced, not a line break), this will return
  null. For space characters that are a line wrap point, this will
  return the position before the line break.
  */
  coordsForChar(t) {
    return this.readMeasured(), this.docView.coordsForChar(t);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(t) {
    return !this.state.facet(Ea) || t < this.viewport.from || t > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(t));
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(t) {
    if (t.length > Au)
      return Ma(t.length);
    let e = this.textDirectionAt(t.from), i;
    for (let r of this.bidiCache)
      if (r.from == t.from && r.dir == e && (r.fresh || Aa(r.isolates, i = Ao(this, t))))
        return r.order;
    i || (i = Ao(this, t));
    let s = wf(t.text, e, i);
    return this.bidiCache.push(new Bn(t.from, t.to, e, i, !0, s)), s;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var t;
    return (this.dom.ownerDocument.hasFocus() || T.safari && ((t = this.inputState) === null || t === void 0 ? void 0 : t.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      ha(this.contentDOM), this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(t) {
    this._root != t && (this._root = t, this.observer.setWindow((t.nodeType == 9 ? t : t.ownerDocument).defaultView || window), this.mountStyles());
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    this.root.activeElement == this.contentDOM && this.contentDOM.blur();
    for (let t of this.plugins)
      t.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.docView.destroy(), this.dom.remove(), this.observer.destroy(), this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(t, e = {}) {
    return _i.of(new Ue(typeof t == "number" ? x.cursor(t) : t, e.y, e.x, e.yMargin, e.xMargin));
  }
  /**
  Return an effect that resets the editor to its current (at the
  time this method was called) scroll position. Note that this
  only affects the editor's own scrollable element, not parents.
  See also
  [`EditorViewConfig.scrollTo`](https://codemirror.net/6/docs/ref/#view.EditorViewConfig.scrollTo).
  
  The effect should be used with a document identical to the one
  it was created for. Failing to do so is not an error, but may
  not scroll to the expected position. You can
  [map](https://codemirror.net/6/docs/ref/#state.StateEffect.map) the effect to account for changes.
  */
  scrollSnapshot() {
    let { scrollTop: t, scrollLeft: e } = this.scrollDOM, i = this.viewState.scrollAnchorAt(t);
    return _i.of(new Ue(x.cursor(i.from), "start", "start", i.top - t, e, !0));
  }
  /**
  Enable or disable tab-focus mode, which disables key bindings
  for Tab and Shift-Tab, letting the browser's default
  focus-changing behavior go through instead. This is useful to
  prevent trapping keyboard users in your editor.
  
  Without argument, this toggles the mode. With a boolean, it
  enables (true) or disables it (false). Given a number, it
  temporarily enables the mode until that number of milliseconds
  have passed or another non-Tab key is pressed.
  */
  setTabFocusMode(t) {
    t == null ? this.inputState.tabFocusMode = this.inputState.tabFocusMode < 0 ? 0 : -1 : typeof t == "boolean" ? this.inputState.tabFocusMode = t ? 0 : -1 : this.inputState.tabFocusMode != 0 && (this.inputState.tabFocusMode = Date.now() + t);
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(t) {
    return Q.define(() => ({}), { eventHandlers: t });
  }
  /**
  Create an extension that registers DOM event observers. Contrary
  to event [handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers),
  observers can't be prevented from running by a higher-precedence
  handler returning true. They also don't prevent other handlers
  and observers from running when they return true, and should not
  call `preventDefault`.
  */
  static domEventObservers(t) {
    return Q.define(() => ({}), { eventObservers: t });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(t, e) {
    let i = ye.newName(), s = [en.of(i), ui.of(ar(`.${i}`, t))];
    return e && e.dark && s.push(or.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(t) {
    return Ne.lowest(ui.of(ar("." + lr, t, nh)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(t) {
    var e;
    let i = t.querySelector(".cm-content"), s = i && K.get(i) || K.get(t);
    return ((e = s == null ? void 0 : s.rootView) === null || e === void 0 ? void 0 : e.view) || null;
  }
}
D.styleModule = ui;
D.inputHandler = Ra;
D.clipboardInputFilter = Rr;
D.clipboardOutputFilter = Pr;
D.scrollHandler = Na;
D.focusChangeEffect = Pa;
D.perLineTextDirection = Ea;
D.exceptionSink = La;
D.updateListener = ir;
D.editable = ae;
D.mouseSelectionStyle = Ba;
D.dragMovesSelection = Ta;
D.clickAddsSelectionRange = Oa;
D.decorations = Di;
D.outerDecorations = Va;
D.atomicRanges = Ir;
D.bidiIsolatedRanges = Wa;
D.scrollMargins = za;
D.darkTheme = or;
D.cspNonce = /* @__PURE__ */ O.define({ combine: (n) => n.length ? n[0] : "" });
D.contentAttributes = Er;
D.editorAttributes = Ha;
D.lineWrapping = /* @__PURE__ */ D.contentAttributes.of({ class: "cm-lineWrapping" });
D.announce = /* @__PURE__ */ R.define();
const Au = 4096, _o = {};
class Bn {
  constructor(t, e, i, s, r, o) {
    this.from = t, this.to = e, this.dir = i, this.isolates = s, this.fresh = r, this.order = o;
  }
  static update(t, e) {
    if (e.empty && !t.some((r) => r.fresh))
      return t;
    let i = [], s = t.length ? t[t.length - 1].dir : Y.LTR;
    for (let r = Math.max(0, t.length - 10); r < t.length; r++) {
      let o = t[r];
      o.dir == s && !e.touchesRange(o.from, o.to) && i.push(new Bn(e.mapPos(o.from, 1), e.mapPos(o.to, -1), o.dir, o.isolates, !1, o.order));
    }
    return i;
  }
}
function Jo(n, t, e) {
  for (let i = n.state.facet(t), s = i.length - 1; s >= 0; s--) {
    let r = i[s], o = typeof r == "function" ? r(n) : r;
    o && _s(o, e);
  }
  return e;
}
const Mu = T.mac ? "mac" : T.windows ? "win" : T.linux ? "linux" : "key";
function Du(n, t) {
  const e = n.split(/-(?!$)/);
  let i = e[e.length - 1];
  i == "Space" && (i = " ");
  let s, r, o, l;
  for (let a = 0; a < e.length - 1; ++a) {
    const c = e[a];
    if (/^(cmd|meta|m)$/i.test(c))
      l = !0;
    else if (/^a(lt)?$/i.test(c))
      s = !0;
    else if (/^(c|ctrl|control)$/i.test(c))
      r = !0;
    else if (/^s(hift)?$/i.test(c))
      o = !0;
    else if (/^mod$/i.test(c))
      t == "mac" ? l = !0 : r = !0;
    else
      throw new Error("Unrecognized modifier name: " + c);
  }
  return s && (i = "Alt-" + i), r && (i = "Ctrl-" + i), l && (i = "Meta-" + i), o && (i = "Shift-" + i), i;
}
function nn(n, t, e) {
  return t.altKey && (n = "Alt-" + n), t.ctrlKey && (n = "Ctrl-" + n), t.metaKey && (n = "Meta-" + n), e !== !1 && t.shiftKey && (n = "Shift-" + n), n;
}
const Ou = /* @__PURE__ */ Ne.default(/* @__PURE__ */ D.domEventHandlers({
  keydown(n, t) {
    return rh(sh(t.state), n, t, "editor");
  }
})), Vr = /* @__PURE__ */ O.define({ enables: Ou }), Xo = /* @__PURE__ */ new WeakMap();
function sh(n) {
  let t = n.facet(Vr), e = Xo.get(t);
  return e || Xo.set(t, e = Lu(t.reduce((i, s) => i.concat(s), []))), e;
}
function Tu(n, t, e) {
  return rh(sh(n.state), t, n, e);
}
let he = null;
const Bu = 4e3;
function Lu(n, t = Mu) {
  let e = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), s = (o, l) => {
    let a = i[o];
    if (a == null)
      i[o] = l;
    else if (a != l)
      throw new Error("Key binding " + o + " is used both as a regular binding and as a multi-stroke prefix");
  }, r = (o, l, a, c, h) => {
    var f, u;
    let d = e[o] || (e[o] = /* @__PURE__ */ Object.create(null)), p = l.split(/ (?!$)/).map((b) => Du(b, t));
    for (let b = 1; b < p.length; b++) {
      let w = p.slice(0, b).join(" ");
      s(w, !0), d[w] || (d[w] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(k) => {
          let S = he = { view: k, prefix: w, scope: o };
          return setTimeout(() => {
            he == S && (he = null);
          }, Bu), !0;
        }]
      });
    }
    let g = p.join(" ");
    s(g, !1);
    let y = d[g] || (d[g] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((u = (f = d._any) === null || f === void 0 ? void 0 : f.run) === null || u === void 0 ? void 0 : u.slice()) || []
    });
    a && y.run.push(a), c && (y.preventDefault = !0), h && (y.stopPropagation = !0);
  };
  for (let o of n) {
    let l = o.scope ? o.scope.split(" ") : ["editor"];
    if (o.any)
      for (let c of l) {
        let h = e[c] || (e[c] = /* @__PURE__ */ Object.create(null));
        h._any || (h._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: f } = o;
        for (let u in h)
          h[u].run.push((d) => f(d, hr));
      }
    let a = o[t] || o.key;
    if (a)
      for (let c of l)
        r(c, a, o.run, o.preventDefault, o.stopPropagation), o.shift && r(c, "Shift-" + a, o.shift, o.preventDefault, o.stopPropagation);
  }
  return e;
}
let hr = null;
function rh(n, t, e, i) {
  hr = t;
  let s = ef(t), r = st(s, 0), o = Bt(r) == s.length && s != " ", l = "", a = !1, c = !1, h = !1;
  he && he.view == e && he.scope == i && (l = he.prefix + " ", Ga.indexOf(t.keyCode) < 0 && (c = !0, he = null));
  let f = /* @__PURE__ */ new Set(), u = (y) => {
    if (y) {
      for (let b of y.run)
        if (!f.has(b) && (f.add(b), b(e)))
          return y.stopPropagation && (h = !0), !0;
      y.preventDefault && (y.stopPropagation && (h = !0), c = !0);
    }
    return !1;
  }, d = n[i], p, g;
  return d && (u(d[l + nn(s, t, !o)]) ? a = !0 : o && (t.altKey || t.metaKey || t.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(T.windows && t.ctrlKey && t.altKey) && (p = be[t.keyCode]) && p != s ? (u(d[l + nn(p, t, !0)]) || t.shiftKey && (g = Ci[t.keyCode]) != s && g != p && u(d[l + nn(g, t, !1)])) && (a = !0) : o && t.shiftKey && u(d[l + nn(s, t, !0)]) && (a = !0), !a && u(d._any) && (a = !0)), c && (a = !0), a && h && t.stopPropagation(), hr = null, a;
}
class Wi {
  /**
  Create a marker with the given class and dimensions. If `width`
  is null, the DOM element will get no width style.
  */
  constructor(t, e, i, s, r) {
    this.className = t, this.left = e, this.top = i, this.width = s, this.height = r;
  }
  draw() {
    let t = document.createElement("div");
    return t.className = this.className, this.adjust(t), t;
  }
  update(t, e) {
    return e.className != this.className ? !1 : (this.adjust(t), !0);
  }
  adjust(t) {
    t.style.left = this.left + "px", t.style.top = this.top + "px", this.width != null && (t.style.width = this.width + "px"), t.style.height = this.height + "px";
  }
  eq(t) {
    return this.left == t.left && this.top == t.top && this.width == t.width && this.height == t.height && this.className == t.className;
  }
  /**
  Create a set of rectangles for the given selection range,
  assigning them theclass`className`. Will create a single
  rectangle for empty ranges, and a set of selection-style
  rectangles covering the range's content (in a bidi-aware
  way) for non-empty ones.
  */
  static forRange(t, e, i) {
    if (i.empty) {
      let s = t.coordsAtPos(i.head, i.assoc || 1);
      if (!s)
        return [];
      let r = oh(t);
      return [new Wi(e, s.left - r.left, s.top - r.top, null, s.bottom - s.top)];
    } else
      return Ru(t, e, i);
  }
}
function oh(n) {
  let t = n.scrollDOM.getBoundingClientRect();
  return { left: (n.textDirection == Y.LTR ? t.left : t.right - n.scrollDOM.clientWidth * n.scaleX) - n.scrollDOM.scrollLeft * n.scaleX, top: t.top - n.scrollDOM.scrollTop * n.scaleY };
}
function Qo(n, t, e, i) {
  let s = n.coordsAtPos(t, e * 2);
  if (!s)
    return i;
  let r = n.dom.getBoundingClientRect(), o = (s.top + s.bottom) / 2, l = n.posAtCoords({ x: r.left + 1, y: o }), a = n.posAtCoords({ x: r.right - 1, y: o });
  return l == null || a == null ? i : { from: Math.max(i.from, Math.min(l, a)), to: Math.min(i.to, Math.max(l, a)) };
}
function Ru(n, t, e) {
  if (e.to <= n.viewport.from || e.from >= n.viewport.to)
    return [];
  let i = Math.max(e.from, n.viewport.from), s = Math.min(e.to, n.viewport.to), r = n.textDirection == Y.LTR, o = n.contentDOM, l = o.getBoundingClientRect(), a = oh(n), c = o.querySelector(".cm-line"), h = c && window.getComputedStyle(c), f = l.left + (h ? parseInt(h.paddingLeft) + Math.min(0, parseInt(h.textIndent)) : 0), u = l.right - (h ? parseInt(h.paddingRight) : 0), d = sr(n, i), p = sr(n, s), g = d.type == gt.Text ? d : null, y = p.type == gt.Text ? p : null;
  if (g && (n.lineWrapping || d.widgetLineBreaks) && (g = Qo(n, i, 1, g)), y && (n.lineWrapping || p.widgetLineBreaks) && (y = Qo(n, s, -1, y)), g && y && g.from == y.from && g.to == y.to)
    return w(k(e.from, e.to, g));
  {
    let v = g ? k(e.from, null, g) : S(d, !1), C = y ? k(null, e.to, y) : S(p, !0), M = [];
    return (g || d).to < (y || p).from - (g && y ? 1 : 0) || d.widgetLineBreaks > 1 && v.bottom + n.defaultLineHeight / 2 < C.top ? M.push(b(f, v.bottom, u, C.top)) : v.bottom < C.top && n.elementAtHeight((v.bottom + C.top) / 2).type == gt.Text && (v.bottom = C.top = (v.bottom + C.top) / 2), w(v).concat(M).concat(w(C));
  }
  function b(v, C, M, P) {
    return new Wi(
      t,
      v - a.left,
      C - a.top - 0.01,
      M - v,
      P - C + 0.01
      /* C.Epsilon */
    );
  }
  function w({ top: v, bottom: C, horizontal: M }) {
    let P = [];
    for (let I = 0; I < M.length; I += 2)
      P.push(b(M[I], v, M[I + 1], C));
    return P;
  }
  function k(v, C, M) {
    let P = 1e9, I = -1e9, q = [];
    function E(W, j, pt, kt, Wt) {
      let it = n.coordsAtPos(W, W == M.to ? -2 : 2), Dt = n.coordsAtPos(pt, pt == M.from ? 2 : -2);
      !it || !Dt || (P = Math.min(it.top, Dt.top, P), I = Math.max(it.bottom, Dt.bottom, I), Wt == Y.LTR ? q.push(r && j ? f : it.left, r && kt ? u : Dt.right) : q.push(!r && kt ? f : Dt.left, !r && j ? u : it.right));
    }
    let L = v ?? M.from, z = C ?? M.to;
    for (let W of n.visibleRanges)
      if (W.to > L && W.from < z)
        for (let j = Math.max(W.from, L), pt = Math.min(W.to, z); ; ) {
          let kt = n.state.doc.lineAt(j);
          for (let Wt of n.bidiSpans(kt)) {
            let it = Wt.from + kt.from, Dt = Wt.to + kt.from;
            if (it >= pt)
              break;
            Dt > j && E(Math.max(it, j), v == null && it <= L, Math.min(Dt, pt), C == null && Dt >= z, Wt.dir);
          }
          if (j = kt.to + 1, j >= pt)
            break;
        }
    return q.length == 0 && E(L, v == null, z, C == null, n.textDirection), { top: P, bottom: I, horizontal: q };
  }
  function S(v, C) {
    let M = l.top + (C ? v.top : v.bottom);
    return { top: M, bottom: M, horizontal: [] };
  }
}
function Pu(n, t) {
  return n.constructor == t.constructor && n.eq(t);
}
class Eu {
  constructor(t, e) {
    this.view = t, this.layer = e, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = t.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), e.above && this.dom.classList.add("cm-layer-above"), e.class && this.dom.classList.add(e.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(t.state), t.requestMeasure(this.measureReq), e.mount && e.mount(this.dom, t);
  }
  update(t) {
    t.startState.facet(wn) != t.state.facet(wn) && this.setOrder(t.state), (this.layer.update(t, this.dom) || t.geometryChanged) && (this.scale(), t.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(t) {
    this.layer.updateOnDocViewUpdate !== !1 && t.requestMeasure(this.measureReq);
  }
  setOrder(t) {
    let e = 0, i = t.facet(wn);
    for (; e < i.length && i[e] != this.layer; )
      e++;
    this.dom.style.zIndex = String((this.layer.above ? 150 : -1) - e);
  }
  measure() {
    return this.layer.markers(this.view);
  }
  scale() {
    let { scaleX: t, scaleY: e } = this.view;
    (t != this.scaleX || e != this.scaleY) && (this.scaleX = t, this.scaleY = e, this.dom.style.transform = `scale(${1 / t}, ${1 / e})`);
  }
  draw(t) {
    if (t.length != this.drawn.length || t.some((e, i) => !Pu(e, this.drawn[i]))) {
      let e = this.dom.firstChild, i = 0;
      for (let s of t)
        s.update && e && s.constructor && this.drawn[i].constructor && s.update(e, this.drawn[i]) ? (e = e.nextSibling, i++) : this.dom.insertBefore(s.draw(), e);
      for (; e; ) {
        let s = e.nextSibling;
        e.remove(), e = s;
      }
      this.drawn = t;
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const wn = /* @__PURE__ */ O.define();
function lh(n) {
  return [
    Q.define((t) => new Eu(t, n)),
    wn.of(n)
  ];
}
const ah = !T.ios, Oi = /* @__PURE__ */ O.define({
  combine(n) {
    return Zt(n, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0
    }, {
      cursorBlinkRate: (t, e) => Math.min(t, e),
      drawRangeCursor: (t, e) => t || e
    });
  }
});
function Iu(n = {}) {
  return [
    Oi.of(n),
    Nu,
    Fu,
    Hu,
    Ia.of(!0)
  ];
}
function hh(n) {
  return n.startState.facet(Oi) != n.state.facet(Oi);
}
const Nu = /* @__PURE__ */ lh({
  above: !0,
  markers(n) {
    let { state: t } = n, e = t.facet(Oi), i = [];
    for (let s of t.selection.ranges) {
      let r = s == t.selection.main;
      if (s.empty ? !r || ah : e.drawRangeCursor) {
        let o = r ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = s.empty ? s : x.cursor(s.head, s.head > s.anchor ? -1 : 1);
        for (let a of Wi.forRange(n, o, l))
          i.push(a);
      }
    }
    return i;
  },
  update(n, t) {
    n.transactions.some((i) => i.selection) && (t.style.animationName = t.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let e = hh(n);
    return e && Zo(n.state, t), n.docChanged || n.selectionSet || e;
  },
  mount(n, t) {
    Zo(t.state, n);
  },
  class: "cm-cursorLayer"
});
function Zo(n, t) {
  t.style.animationDuration = n.facet(Oi).cursorBlinkRate + "ms";
}
const Fu = /* @__PURE__ */ lh({
  above: !1,
  markers(n) {
    return n.state.selection.ranges.map((t) => t.empty ? [] : Wi.forRange(n, "cm-selectionBackground", t)).reduce((t, e) => t.concat(e));
  },
  update(n, t) {
    return n.docChanged || n.selectionSet || n.viewportChanged || hh(n);
  },
  class: "cm-selectionLayer"
}), cr = {
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: "transparent !important" }
  },
  ".cm-content": {
    "& :focus": {
      caretColor: "initial !important",
      "&::selection, & ::selection": {
        backgroundColor: "Highlight !important"
      }
    }
  }
};
ah && (cr[".cm-line"].caretColor = cr[".cm-content"].caretColor = "transparent !important");
const Hu = /* @__PURE__ */ Ne.highest(/* @__PURE__ */ D.theme(cr)), ch = /* @__PURE__ */ R.define({
  map(n, t) {
    return n == null ? null : t.mapPos(n);
  }
}), mi = /* @__PURE__ */ at.define({
  create() {
    return null;
  },
  update(n, t) {
    return n != null && (n = t.changes.mapPos(n)), t.effects.reduce((e, i) => i.is(ch) ? i.value : e, n);
  }
}), Vu = /* @__PURE__ */ Q.fromClass(class {
  constructor(n) {
    this.view = n, this.cursor = null, this.measureReq = { read: this.readPos.bind(this), write: this.drawCursor.bind(this) };
  }
  update(n) {
    var t;
    let e = n.state.field(mi);
    e == null ? this.cursor != null && ((t = this.cursor) === null || t === void 0 || t.remove(), this.cursor = null) : (this.cursor || (this.cursor = this.view.scrollDOM.appendChild(document.createElement("div")), this.cursor.className = "cm-dropCursor"), (n.startState.field(mi) != e || n.docChanged || n.geometryChanged) && this.view.requestMeasure(this.measureReq));
  }
  readPos() {
    let { view: n } = this, t = n.state.field(mi), e = t != null && n.coordsAtPos(t);
    if (!e)
      return null;
    let i = n.scrollDOM.getBoundingClientRect();
    return {
      left: e.left - i.left + n.scrollDOM.scrollLeft * n.scaleX,
      top: e.top - i.top + n.scrollDOM.scrollTop * n.scaleY,
      height: e.bottom - e.top
    };
  }
  drawCursor(n) {
    if (this.cursor) {
      let { scaleX: t, scaleY: e } = this.view;
      n ? (this.cursor.style.left = n.left / t + "px", this.cursor.style.top = n.top / e + "px", this.cursor.style.height = n.height / e + "px") : this.cursor.style.left = "-100000px";
    }
  }
  destroy() {
    this.cursor && this.cursor.remove();
  }
  setDropPos(n) {
    this.view.state.field(mi) != n && this.view.dispatch({ effects: ch.of(n) });
  }
}, {
  eventObservers: {
    dragover(n) {
      this.setDropPos(this.view.posAtCoords({ x: n.clientX, y: n.clientY }));
    },
    dragleave(n) {
      (n.target == this.view.contentDOM || !this.view.contentDOM.contains(n.relatedTarget)) && this.setDropPos(null);
    },
    dragend() {
      this.setDropPos(null);
    },
    drop() {
      this.setDropPos(null);
    }
  }
});
function Wu() {
  return [mi, Vu];
}
function tl(n, t, e, i, s) {
  t.lastIndex = 0;
  for (let r = n.iterRange(e, i), o = e, l; !r.next().done; o += r.value.length)
    if (!r.lineBreak)
      for (; l = t.exec(r.value); )
        s(o + l.index, l);
}
function zu(n, t) {
  let e = n.visibleRanges;
  if (e.length == 1 && e[0].from == n.viewport.from && e[0].to == n.viewport.to)
    return e;
  let i = [];
  for (let { from: s, to: r } of e)
    s = Math.max(n.state.doc.lineAt(s).from, s - t), r = Math.min(n.state.doc.lineAt(r).to, r + t), i.length && i[i.length - 1].to >= s ? i[i.length - 1].to = r : i.push({ from: s, to: r });
  return i;
}
class qu {
  /**
  Create a decorator.
  */
  constructor(t) {
    const { regexp: e, decoration: i, decorate: s, boundary: r, maxLength: o = 1e3 } = t;
    if (!e.global)
      throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
    if (this.regexp = e, s)
      this.addMatch = (l, a, c, h) => s(h, c, c + l[0].length, l, a);
    else if (typeof i == "function")
      this.addMatch = (l, a, c, h) => {
        let f = i(l, a, c);
        f && h(c, c + l[0].length, f);
      };
    else if (i)
      this.addMatch = (l, a, c, h) => h(c, c + l[0].length, i);
    else
      throw new RangeError("Either 'decorate' or 'decoration' should be provided to MatchDecorator");
    this.boundary = r, this.maxLength = o;
  }
  /**
  Compute the full set of decorations for matches in the given
  view's viewport. You'll want to call this when initializing your
  plugin.
  */
  createDeco(t) {
    let e = new ge(), i = e.add.bind(e);
    for (let { from: s, to: r } of zu(t, this.maxLength))
      tl(t.state.doc, this.regexp, s, r, (o, l) => this.addMatch(l, t, o, i));
    return e.finish();
  }
  /**
  Update a set of decorations for a view update. `deco` _must_ be
  the set of decorations produced by _this_ `MatchDecorator` for
  the view state before the update.
  */
  updateDeco(t, e) {
    let i = 1e9, s = -1;
    return t.docChanged && t.changes.iterChanges((r, o, l, a) => {
      a > t.view.viewport.from && l < t.view.viewport.to && (i = Math.min(l, i), s = Math.max(a, s));
    }), t.viewportChanged || s - i > 1e3 ? this.createDeco(t.view) : s > -1 ? this.updateRange(t.view, e.map(t.changes), i, s) : e;
  }
  updateRange(t, e, i, s) {
    for (let r of t.visibleRanges) {
      let o = Math.max(r.from, i), l = Math.min(r.to, s);
      if (l > o) {
        let a = t.state.doc.lineAt(o), c = a.to < l ? t.state.doc.lineAt(l) : a, h = Math.max(r.from, a.from), f = Math.min(r.to, c.to);
        if (this.boundary) {
          for (; o > a.from; o--)
            if (this.boundary.test(a.text[o - 1 - a.from])) {
              h = o;
              break;
            }
          for (; l < c.to; l++)
            if (this.boundary.test(c.text[l - c.from])) {
              f = l;
              break;
            }
        }
        let u = [], d, p = (g, y, b) => u.push(b.range(g, y));
        if (a == c)
          for (this.regexp.lastIndex = h - a.from; (d = this.regexp.exec(a.text)) && d.index < f - a.from; )
            this.addMatch(d, t, d.index + a.from, p);
        else
          tl(t.state.doc, this.regexp, h, f, (g, y) => this.addMatch(y, t, g, p));
        e = e.update({ filterFrom: h, filterTo: f, filter: (g, y) => g < h || y > f, add: u });
      }
    }
    return e;
  }
}
const fr = /x/.unicode != null ? "gu" : "g", $u = /* @__PURE__ */ new RegExp(`[\0-\b
--­؜​‎‏\u2028\u2029‭‮⁦⁧⁩\uFEFF￹-￼]`, fr), Ku = {
  0: "null",
  7: "bell",
  8: "backspace",
  10: "newline",
  11: "vertical tab",
  13: "carriage return",
  27: "escape",
  8203: "zero width space",
  8204: "zero width non-joiner",
  8205: "zero width joiner",
  8206: "left-to-right mark",
  8207: "right-to-left mark",
  8232: "line separator",
  8237: "left-to-right override",
  8238: "right-to-left override",
  8294: "left-to-right isolate",
  8295: "right-to-left isolate",
  8297: "pop directional isolate",
  8233: "paragraph separator",
  65279: "zero width no-break space",
  65532: "object replacement"
};
let ms = null;
function ju() {
  var n;
  if (ms == null && typeof document < "u" && document.body) {
    let t = document.body.style;
    ms = ((n = t.tabSize) !== null && n !== void 0 ? n : t.MozTabSize) != null;
  }
  return ms || !1;
}
const vn = /* @__PURE__ */ O.define({
  combine(n) {
    let t = Zt(n, {
      render: null,
      specialChars: $u,
      addSpecialChars: null
    });
    return (t.replaceTabs = !ju()) && (t.specialChars = new RegExp("	|" + t.specialChars.source, fr)), t.addSpecialChars && (t.specialChars = new RegExp(t.specialChars.source + "|" + t.addSpecialChars.source, fr)), t;
  }
});
function Uu(n = {}) {
  return [vn.of(n), Gu()];
}
let el = null;
function Gu() {
  return el || (el = Q.fromClass(class {
    constructor(n) {
      this.view = n, this.decorations = B.none, this.decorationCache = /* @__PURE__ */ Object.create(null), this.decorator = this.makeDecorator(n.state.facet(vn)), this.decorations = this.decorator.createDeco(n);
    }
    makeDecorator(n) {
      return new qu({
        regexp: n.specialChars,
        decoration: (t, e, i) => {
          let { doc: s } = e.state, r = st(t[0], 0);
          if (r == 9) {
            let o = s.lineAt(i), l = e.state.tabSize, a = ii(o.text, l, i - o.from);
            return B.replace({
              widget: new Xu((l - a % l) * this.view.defaultCharacterWidth / this.view.scaleX)
            });
          }
          return this.decorationCache[r] || (this.decorationCache[r] = B.replace({ widget: new Ju(n, r) }));
        },
        boundary: n.replaceTabs ? void 0 : /[^]/
      });
    }
    update(n) {
      let t = n.state.facet(vn);
      n.startState.facet(vn) != t ? (this.decorator = this.makeDecorator(t), this.decorations = this.decorator.createDeco(n.view)) : this.decorations = this.decorator.updateDeco(n, this.decorations);
    }
  }, {
    decorations: (n) => n.decorations
  }));
}
const Yu = "•";
function _u(n) {
  return n >= 32 ? Yu : n == 10 ? "␤" : String.fromCharCode(9216 + n);
}
class Ju extends ke {
  constructor(t, e) {
    super(), this.options = t, this.code = e;
  }
  eq(t) {
    return t.code == this.code;
  }
  toDOM(t) {
    let e = _u(this.code), i = t.state.phrase("Control character") + " " + (Ku[this.code] || "0x" + this.code.toString(16)), s = this.options.render && this.options.render(this.code, i, e);
    if (s)
      return s;
    let r = document.createElement("span");
    return r.textContent = e, r.title = i, r.setAttribute("aria-label", i), r.className = "cm-specialChar", r;
  }
  ignoreEvent() {
    return !1;
  }
}
class Xu extends ke {
  constructor(t) {
    super(), this.width = t;
  }
  eq(t) {
    return t.width == this.width;
  }
  toDOM() {
    let t = document.createElement("span");
    return t.textContent = "	", t.className = "cm-tab", t.style.width = this.width + "px", t;
  }
  ignoreEvent() {
    return !1;
  }
}
function Qu() {
  return td;
}
const Zu = /* @__PURE__ */ B.line({ class: "cm-activeLine" }), td = /* @__PURE__ */ Q.fromClass(class {
  constructor(n) {
    this.decorations = this.getDeco(n);
  }
  update(n) {
    (n.docChanged || n.selectionSet) && (this.decorations = this.getDeco(n.view));
  }
  getDeco(n) {
    let t = -1, e = [];
    for (let i of n.state.selection.ranges) {
      let s = n.lineBlockAt(i.head);
      s.from > t && (e.push(Zu.range(s.from)), t = s.from);
    }
    return B.set(e);
  }
}, {
  decorations: (n) => n.decorations
}), ur = 2e3;
function ed(n, t, e) {
  let i = Math.min(t.line, e.line), s = Math.max(t.line, e.line), r = [];
  if (t.off > ur || e.off > ur || t.col < 0 || e.col < 0) {
    let o = Math.min(t.off, e.off), l = Math.max(t.off, e.off);
    for (let a = i; a <= s; a++) {
      let c = n.doc.line(a);
      c.length <= l && r.push(x.range(c.from + o, c.to + l));
    }
  } else {
    let o = Math.min(t.col, e.col), l = Math.max(t.col, e.col);
    for (let a = i; a <= s; a++) {
      let c = n.doc.line(a), h = qs(c.text, o, n.tabSize, !0);
      if (h < 0)
        r.push(x.cursor(c.to));
      else {
        let f = qs(c.text, l, n.tabSize);
        r.push(x.range(c.from + h, c.from + f));
      }
    }
  }
  return r;
}
function id(n, t) {
  let e = n.coordsAtPos(n.viewport.from);
  return e ? Math.round(Math.abs((e.left - t) / n.defaultCharacterWidth)) : -1;
}
function il(n, t) {
  let e = n.posAtCoords({ x: t.clientX, y: t.clientY }, !1), i = n.state.doc.lineAt(e), s = e - i.from, r = s > ur ? -1 : s == i.length ? id(n, t.clientX) : ii(i.text, n.state.tabSize, e - i.from);
  return { line: i.number, col: r, off: s };
}
function nd(n, t) {
  let e = il(n, t), i = n.state.selection;
  return e ? {
    update(s) {
      if (s.docChanged) {
        let r = s.changes.mapPos(s.startState.doc.line(e.line).from), o = s.state.doc.lineAt(r);
        e = { line: o.number, col: e.col, off: Math.min(e.off, o.length) }, i = i.map(s.changes);
      }
    },
    get(s, r, o) {
      let l = il(n, s);
      if (!l)
        return i;
      let a = ed(n.state, e, l);
      return a.length ? o ? x.create(a.concat(i.ranges)) : x.create(a) : i;
    }
  } : null;
}
function sd(n) {
  let t = (e) => e.altKey && e.button == 0;
  return D.mouseSelectionStyle.of((e, i) => t(i) ? nd(e, i) : null);
}
const rd = {
  Alt: [18, (n) => !!n.altKey],
  Control: [17, (n) => !!n.ctrlKey],
  Shift: [16, (n) => !!n.shiftKey],
  Meta: [91, (n) => !!n.metaKey]
}, od = { style: "cursor: crosshair" };
function ld(n = {}) {
  let [t, e] = rd[n.key || "Alt"], i = Q.fromClass(class {
    constructor(s) {
      this.view = s, this.isDown = !1;
    }
    set(s) {
      this.isDown != s && (this.isDown = s, this.view.update([]));
    }
  }, {
    eventObservers: {
      keydown(s) {
        this.set(s.keyCode == t || e(s));
      },
      keyup(s) {
        (s.keyCode == t || !e(s)) && this.set(!1);
      },
      mousemove(s) {
        this.set(e(s));
      }
    }
  });
  return [
    i,
    D.contentAttributes.of((s) => {
      var r;
      return !((r = s.plugin(i)) === null || r === void 0) && r.isDown ? od : null;
    })
  ];
}
const li = "-10000px";
class fh {
  constructor(t, e, i, s) {
    this.facet = e, this.createTooltipView = i, this.removeTooltipView = s, this.input = t.state.facet(e), this.tooltips = this.input.filter((o) => o);
    let r = null;
    this.tooltipViews = this.tooltips.map((o) => r = i(o, r));
  }
  update(t, e) {
    var i;
    let s = t.state.facet(this.facet), r = s.filter((a) => a);
    if (s === this.input) {
      for (let a of this.tooltipViews)
        a.update && a.update(t);
      return !1;
    }
    let o = [], l = e ? [] : null;
    for (let a = 0; a < r.length; a++) {
      let c = r[a], h = -1;
      if (c) {
        for (let f = 0; f < this.tooltips.length; f++) {
          let u = this.tooltips[f];
          u && u.create == c.create && (h = f);
        }
        if (h < 0)
          o[a] = this.createTooltipView(c, a ? o[a - 1] : null), l && (l[a] = !!c.above);
        else {
          let f = o[a] = this.tooltipViews[h];
          l && (l[a] = e[h]), f.update && f.update(t);
        }
      }
    }
    for (let a of this.tooltipViews)
      o.indexOf(a) < 0 && (this.removeTooltipView(a), (i = a.destroy) === null || i === void 0 || i.call(a));
    return e && (l.forEach((a, c) => e[c] = a), e.length = l.length), this.input = s, this.tooltips = r, this.tooltipViews = o, !0;
  }
}
function ad(n) {
  let { win: t } = n;
  return { top: 0, left: 0, bottom: t.innerHeight, right: t.innerWidth };
}
const gs = /* @__PURE__ */ O.define({
  combine: (n) => {
    var t, e, i;
    return {
      position: T.ios ? "absolute" : ((t = n.find((s) => s.position)) === null || t === void 0 ? void 0 : t.position) || "fixed",
      parent: ((e = n.find((s) => s.parent)) === null || e === void 0 ? void 0 : e.parent) || null,
      tooltipSpace: ((i = n.find((s) => s.tooltipSpace)) === null || i === void 0 ? void 0 : i.tooltipSpace) || ad
    };
  }
}), nl = /* @__PURE__ */ new WeakMap(), Wr = /* @__PURE__ */ Q.fromClass(class {
  constructor(n) {
    this.view = n, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let t = n.state.facet(gs);
    this.position = t.position, this.parent = t.parent, this.classes = n.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new fh(n, zr, (e, i) => this.createTooltip(e, i), (e) => {
      this.resizeObserver && this.resizeObserver.unobserve(e.dom), e.dom.remove();
    }), this.above = this.manager.tooltips.map((e) => !!e.above), this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((e) => {
      Date.now() > this.lastTransaction - 50 && e.length > 0 && e[e.length - 1].intersectionRatio < 1 && this.measureSoon();
    }, { threshold: [1] }) : null, this.observeIntersection(), n.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this)), this.maybeMeasure();
  }
  createContainer() {
    this.parent ? (this.container = document.createElement("div"), this.container.style.position = "relative", this.container.className = this.view.themeClasses, this.parent.appendChild(this.container)) : this.container = this.view.dom;
  }
  observeIntersection() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      for (let n of this.manager.tooltipViews)
        this.intersectionObserver.observe(n.dom);
    }
  }
  measureSoon() {
    this.measureTimeout < 0 && (this.measureTimeout = setTimeout(() => {
      this.measureTimeout = -1, this.maybeMeasure();
    }, 50));
  }
  update(n) {
    n.transactions.length && (this.lastTransaction = Date.now());
    let t = this.manager.update(n, this.above);
    t && this.observeIntersection();
    let e = t || n.geometryChanged, i = n.state.facet(gs);
    if (i.position != this.position && !this.madeAbsolute) {
      this.position = i.position;
      for (let s of this.manager.tooltipViews)
        s.dom.style.position = this.position;
      e = !0;
    }
    if (i.parent != this.parent) {
      this.parent && this.container.remove(), this.parent = i.parent, this.createContainer();
      for (let s of this.manager.tooltipViews)
        this.container.appendChild(s.dom);
      e = !0;
    } else this.parent && this.view.themeClasses != this.classes && (this.classes = this.container.className = this.view.themeClasses);
    e && this.maybeMeasure();
  }
  createTooltip(n, t) {
    let e = n.create(this.view), i = t ? t.dom : null;
    if (e.dom.classList.add("cm-tooltip"), n.arrow && !e.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
      let s = document.createElement("div");
      s.className = "cm-tooltip-arrow", e.dom.appendChild(s);
    }
    return e.dom.style.position = this.position, e.dom.style.top = li, e.dom.style.left = "0px", this.container.insertBefore(e.dom, i), e.mount && e.mount(this.view), this.resizeObserver && this.resizeObserver.observe(e.dom), e;
  }
  destroy() {
    var n, t, e;
    this.view.win.removeEventListener("resize", this.measureSoon);
    for (let i of this.manager.tooltipViews)
      i.dom.remove(), (n = i.destroy) === null || n === void 0 || n.call(i);
    this.parent && this.container.remove(), (t = this.resizeObserver) === null || t === void 0 || t.disconnect(), (e = this.intersectionObserver) === null || e === void 0 || e.disconnect(), clearTimeout(this.measureTimeout);
  }
  readMeasure() {
    let n = this.view.dom.getBoundingClientRect(), t = 1, e = 1, i = !1;
    if (this.position == "fixed" && this.manager.tooltipViews.length) {
      let { dom: s } = this.manager.tooltipViews[0];
      if (T.gecko)
        i = s.offsetParent != this.container.ownerDocument.body;
      else if (s.style.top == li && s.style.left == "0px") {
        let r = s.getBoundingClientRect();
        i = Math.abs(r.top + 1e4) > 1 || Math.abs(r.left) > 1;
      }
    }
    if (i || this.position == "absolute")
      if (this.parent) {
        let s = this.parent.getBoundingClientRect();
        s.width && s.height && (t = s.width / this.parent.offsetWidth, e = s.height / this.parent.offsetHeight);
      } else
        ({ scaleX: t, scaleY: e } = this.view.viewState);
    return {
      editor: n,
      parent: this.parent ? this.container.getBoundingClientRect() : n,
      pos: this.manager.tooltips.map((s, r) => {
        let o = this.manager.tooltipViews[r];
        return o.getCoords ? o.getCoords(s.pos) : this.view.coordsAtPos(s.pos);
      }),
      size: this.manager.tooltipViews.map(({ dom: s }) => s.getBoundingClientRect()),
      space: this.view.state.facet(gs).tooltipSpace(this.view),
      scaleX: t,
      scaleY: e,
      makeAbsolute: i
    };
  }
  writeMeasure(n) {
    var t;
    if (n.makeAbsolute) {
      this.madeAbsolute = !0, this.position = "absolute";
      for (let l of this.manager.tooltipViews)
        l.dom.style.position = "absolute";
    }
    let { editor: e, space: i, scaleX: s, scaleY: r } = n, o = [];
    for (let l = 0; l < this.manager.tooltips.length; l++) {
      let a = this.manager.tooltips[l], c = this.manager.tooltipViews[l], { dom: h } = c, f = n.pos[l], u = n.size[l];
      if (!f || f.bottom <= Math.max(e.top, i.top) || f.top >= Math.min(e.bottom, i.bottom) || f.right < Math.max(e.left, i.left) - 0.1 || f.left > Math.min(e.right, i.right) + 0.1) {
        h.style.top = li;
        continue;
      }
      let d = a.arrow ? c.dom.querySelector(".cm-tooltip-arrow") : null, p = d ? 7 : 0, g = u.right - u.left, y = (t = nl.get(c)) !== null && t !== void 0 ? t : u.bottom - u.top, b = c.offset || cd, w = this.view.textDirection == Y.LTR, k = u.width > i.right - i.left ? w ? i.left : i.right - u.width : w ? Math.max(i.left, Math.min(f.left - (d ? 14 : 0) + b.x, i.right - g)) : Math.min(Math.max(i.left, f.left - g + (d ? 14 : 0) - b.x), i.right - g), S = this.above[l];
      !a.strictSide && (S ? f.top - (u.bottom - u.top) - b.y < i.top : f.bottom + (u.bottom - u.top) + b.y > i.bottom) && S == i.bottom - f.bottom > f.top - i.top && (S = this.above[l] = !S);
      let v = (S ? f.top - i.top : i.bottom - f.bottom) - p;
      if (v < y && c.resize !== !1) {
        if (v < this.view.defaultLineHeight) {
          h.style.top = li;
          continue;
        }
        nl.set(c, y), h.style.height = (y = v) / r + "px";
      } else h.style.height && (h.style.height = "");
      let C = S ? f.top - y - p - b.y : f.bottom + p + b.y, M = k + g;
      if (c.overlap !== !0)
        for (let P of o)
          P.left < M && P.right > k && P.top < C + y && P.bottom > C && (C = S ? P.top - y - 2 - p : P.bottom + p + 2);
      if (this.position == "absolute" ? (h.style.top = (C - n.parent.top) / r + "px", h.style.left = (k - n.parent.left) / s + "px") : (h.style.top = C / r + "px", h.style.left = k / s + "px"), d) {
        let P = f.left + (w ? b.x : -b.x) - (k + 14 - 7);
        d.style.left = P / s + "px";
      }
      c.overlap !== !0 && o.push({ left: k, top: C, right: M, bottom: C + y }), h.classList.toggle("cm-tooltip-above", S), h.classList.toggle("cm-tooltip-below", !S), c.positioned && c.positioned(n.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let n of this.manager.tooltipViews)
        n.dom.style.top = li;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
}), hd = /* @__PURE__ */ D.baseTheme({
  ".cm-tooltip": {
    zIndex: 100,
    boxSizing: "border-box"
  },
  "&light .cm-tooltip": {
    border: "1px solid #bbb",
    backgroundColor: "#f5f5f5"
  },
  "&light .cm-tooltip-section:not(:first-child)": {
    borderTop: "1px solid #bbb"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tooltip-arrow": {
    height: "7px",
    width: `${7 * 2}px`,
    position: "absolute",
    zIndex: -1,
    overflow: "hidden",
    "&:before, &:after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      borderLeft: "7px solid transparent",
      borderRight: "7px solid transparent"
    },
    ".cm-tooltip-above &": {
      bottom: "-7px",
      "&:before": {
        borderTop: "7px solid #bbb"
      },
      "&:after": {
        borderTop: "7px solid #f5f5f5",
        bottom: "1px"
      }
    },
    ".cm-tooltip-below &": {
      top: "-7px",
      "&:before": {
        borderBottom: "7px solid #bbb"
      },
      "&:after": {
        borderBottom: "7px solid #f5f5f5",
        top: "1px"
      }
    }
  },
  "&dark .cm-tooltip .cm-tooltip-arrow": {
    "&:before": {
      borderTopColor: "#333338",
      borderBottomColor: "#333338"
    },
    "&:after": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    }
  }
}), cd = { x: 0, y: 0 }, zr = /* @__PURE__ */ O.define({
  enables: [Wr, hd]
}), Ln = /* @__PURE__ */ O.define({
  combine: (n) => n.reduce((t, e) => t.concat(e), [])
});
class Zn {
  // Needs to be static so that host tooltip instances always match
  static create(t) {
    return new Zn(t);
  }
  constructor(t) {
    this.view = t, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new fh(t, Ln, (e, i) => this.createHostedView(e, i), (e) => e.dom.remove());
  }
  createHostedView(t, e) {
    let i = t.create(this.view);
    return i.dom.classList.add("cm-tooltip-section"), this.dom.insertBefore(i.dom, e ? e.dom.nextSibling : this.dom.firstChild), this.mounted && i.mount && i.mount(this.view), i;
  }
  mount(t) {
    for (let e of this.manager.tooltipViews)
      e.mount && e.mount(t);
    this.mounted = !0;
  }
  positioned(t) {
    for (let e of this.manager.tooltipViews)
      e.positioned && e.positioned(t);
  }
  update(t) {
    this.manager.update(t);
  }
  destroy() {
    var t;
    for (let e of this.manager.tooltipViews)
      (t = e.destroy) === null || t === void 0 || t.call(e);
  }
  passProp(t) {
    let e;
    for (let i of this.manager.tooltipViews) {
      let s = i[t];
      if (s !== void 0) {
        if (e === void 0)
          e = s;
        else if (e !== s)
          return;
      }
    }
    return e;
  }
  get offset() {
    return this.passProp("offset");
  }
  get getCoords() {
    return this.passProp("getCoords");
  }
  get overlap() {
    return this.passProp("overlap");
  }
  get resize() {
    return this.passProp("resize");
  }
}
const fd = /* @__PURE__ */ zr.compute([Ln], (n) => {
  let t = n.facet(Ln);
  return t.length === 0 ? null : {
    pos: Math.min(...t.map((e) => e.pos)),
    end: Math.max(...t.map((e) => {
      var i;
      return (i = e.end) !== null && i !== void 0 ? i : e.pos;
    })),
    create: Zn.create,
    above: t[0].above,
    arrow: t.some((e) => e.arrow)
  };
});
class ud {
  constructor(t, e, i, s, r) {
    this.view = t, this.source = e, this.field = i, this.setHover = s, this.hoverTime = r, this.hoverTimeout = -1, this.restartTimeout = -1, this.pending = null, this.lastMove = { x: 0, y: 0, target: t.dom, time: 0 }, this.checkHover = this.checkHover.bind(this), t.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this)), t.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
  }
  update() {
    this.pending && (this.pending = null, clearTimeout(this.restartTimeout), this.restartTimeout = setTimeout(() => this.startHover(), 20));
  }
  get active() {
    return this.view.state.field(this.field);
  }
  checkHover() {
    if (this.hoverTimeout = -1, this.active.length)
      return;
    let t = Date.now() - this.lastMove.time;
    t < this.hoverTime ? this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime - t) : this.startHover();
  }
  startHover() {
    clearTimeout(this.restartTimeout);
    let { view: t, lastMove: e } = this, i = t.docView.nearest(e.target);
    if (!i)
      return;
    let s, r = 1;
    if (i instanceof fe)
      s = i.posAtStart;
    else {
      if (s = t.posAtCoords(e), s == null)
        return;
      let l = t.coordsAtPos(s);
      if (!l || e.y < l.top || e.y > l.bottom || e.x < l.left - t.defaultCharacterWidth || e.x > l.right + t.defaultCharacterWidth)
        return;
      let a = t.bidiSpans(t.state.doc.lineAt(s)).find((h) => h.from <= s && h.to >= s), c = a && a.dir == Y.RTL ? -1 : 1;
      r = e.x < l.left ? -c : c;
    }
    let o = this.source(t, s, r);
    if (o != null && o.then) {
      let l = this.pending = { pos: s };
      o.then((a) => {
        this.pending == l && (this.pending = null, a && !(Array.isArray(a) && !a.length) && t.dispatch({ effects: this.setHover.of(Array.isArray(a) ? a : [a]) }));
      }, (a) => wt(t.state, a, "hover tooltip"));
    } else o && !(Array.isArray(o) && !o.length) && t.dispatch({ effects: this.setHover.of(Array.isArray(o) ? o : [o]) });
  }
  get tooltip() {
    let t = this.view.plugin(Wr), e = t ? t.manager.tooltips.findIndex((i) => i.create == Zn.create) : -1;
    return e > -1 ? t.manager.tooltipViews[e] : null;
  }
  mousemove(t) {
    var e, i;
    this.lastMove = { x: t.clientX, y: t.clientY, target: t.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: s, tooltip: r } = this;
    if (s.length && r && !dd(r.dom, t) || this.pending) {
      let { pos: o } = s[0] || this.pending, l = (i = (e = s[0]) === null || e === void 0 ? void 0 : e.end) !== null && i !== void 0 ? i : o;
      (o == l ? this.view.posAtCoords(this.lastMove) != o : !pd(this.view, o, l, t.clientX, t.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
    }
  }
  mouseleave(t) {
    clearTimeout(this.hoverTimeout), this.hoverTimeout = -1;
    let { active: e } = this;
    if (e.length) {
      let { tooltip: i } = this;
      i && i.dom.contains(t.relatedTarget) ? this.watchTooltipLeave(i.dom) : this.view.dispatch({ effects: this.setHover.of([]) });
    }
  }
  watchTooltipLeave(t) {
    let e = (i) => {
      t.removeEventListener("mouseleave", e), this.active.length && !this.view.dom.contains(i.relatedTarget) && this.view.dispatch({ effects: this.setHover.of([]) });
    };
    t.addEventListener("mouseleave", e);
  }
  destroy() {
    clearTimeout(this.hoverTimeout), this.view.dom.removeEventListener("mouseleave", this.mouseleave), this.view.dom.removeEventListener("mousemove", this.mousemove);
  }
}
const sn = 4;
function dd(n, t) {
  let { left: e, right: i, top: s, bottom: r } = n.getBoundingClientRect(), o;
  if (o = n.querySelector(".cm-tooltip-arrow")) {
    let l = o.getBoundingClientRect();
    s = Math.min(l.top, s), r = Math.max(l.bottom, r);
  }
  return t.clientX >= e - sn && t.clientX <= i + sn && t.clientY >= s - sn && t.clientY <= r + sn;
}
function pd(n, t, e, i, s, r) {
  let o = n.scrollDOM.getBoundingClientRect(), l = n.documentTop + n.documentPadding.top + n.contentHeight;
  if (o.left > i || o.right < i || o.top > s || Math.min(o.bottom, l) < s)
    return !1;
  let a = n.posAtCoords({ x: i, y: s }, !1);
  return a >= t && a <= e;
}
function md(n, t = {}) {
  let e = R.define(), i = at.define({
    create() {
      return [];
    },
    update(s, r) {
      if (s.length && (t.hideOnChange && (r.docChanged || r.selection) ? s = [] : t.hideOn && (s = s.filter((o) => !t.hideOn(r, o))), r.docChanged)) {
        let o = [];
        for (let l of s) {
          let a = r.changes.mapPos(l.pos, -1, mt.TrackDel);
          if (a != null) {
            let c = Object.assign(/* @__PURE__ */ Object.create(null), l);
            c.pos = a, c.end != null && (c.end = r.changes.mapPos(c.end)), o.push(c);
          }
        }
        s = o;
      }
      for (let o of r.effects)
        o.is(e) && (s = o.value), o.is(gd) && (s = []);
      return s;
    },
    provide: (s) => Ln.from(s)
  });
  return {
    active: i,
    extension: [
      i,
      Q.define((s) => new ud(
        s,
        n,
        i,
        e,
        t.hoverTime || 300
        /* Hover.Time */
      )),
      fd
    ]
  };
}
function uh(n, t) {
  let e = n.plugin(Wr);
  if (!e)
    return null;
  let i = e.manager.tooltips.indexOf(t);
  return i < 0 ? null : e.manager.tooltipViews[i];
}
const gd = /* @__PURE__ */ R.define(), sl = /* @__PURE__ */ O.define({
  combine(n) {
    let t, e;
    for (let i of n)
      t = t || i.topContainer, e = e || i.bottomContainer;
    return { topContainer: t, bottomContainer: e };
  }
});
function Ti(n, t) {
  let e = n.plugin(dh), i = e ? e.specs.indexOf(t) : -1;
  return i > -1 ? e.panels[i] : null;
}
const dh = /* @__PURE__ */ Q.fromClass(class {
  constructor(n) {
    this.input = n.state.facet(Bi), this.specs = this.input.filter((e) => e), this.panels = this.specs.map((e) => e(n));
    let t = n.state.facet(sl);
    this.top = new rn(n, !0, t.topContainer), this.bottom = new rn(n, !1, t.bottomContainer), this.top.sync(this.panels.filter((e) => e.top)), this.bottom.sync(this.panels.filter((e) => !e.top));
    for (let e of this.panels)
      e.dom.classList.add("cm-panel"), e.mount && e.mount();
  }
  update(n) {
    let t = n.state.facet(sl);
    this.top.container != t.topContainer && (this.top.sync([]), this.top = new rn(n.view, !0, t.topContainer)), this.bottom.container != t.bottomContainer && (this.bottom.sync([]), this.bottom = new rn(n.view, !1, t.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let e = n.state.facet(Bi);
    if (e != this.input) {
      let i = e.filter((a) => a), s = [], r = [], o = [], l = [];
      for (let a of i) {
        let c = this.specs.indexOf(a), h;
        c < 0 ? (h = a(n.view), l.push(h)) : (h = this.panels[c], h.update && h.update(n)), s.push(h), (h.top ? r : o).push(h);
      }
      this.specs = i, this.panels = s, this.top.sync(r), this.bottom.sync(o);
      for (let a of l)
        a.dom.classList.add("cm-panel"), a.mount && a.mount();
    } else
      for (let i of this.panels)
        i.update && i.update(n);
  }
  destroy() {
    this.top.sync([]), this.bottom.sync([]);
  }
}, {
  provide: (n) => D.scrollMargins.of((t) => {
    let e = t.plugin(n);
    return e && { top: e.top.scrollMargin(), bottom: e.bottom.scrollMargin() };
  })
});
class rn {
  constructor(t, e, i) {
    this.view = t, this.top = e, this.container = i, this.dom = void 0, this.classes = "", this.panels = [], this.syncClasses();
  }
  sync(t) {
    for (let e of this.panels)
      e.destroy && t.indexOf(e) < 0 && e.destroy();
    this.panels = t, this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      this.dom && (this.dom.remove(), this.dom = void 0);
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div"), this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom", this.dom.style[this.top ? "top" : "bottom"] = "0";
      let e = this.container || this.view.dom;
      e.insertBefore(this.dom, this.top ? e.firstChild : null);
    }
    let t = this.dom.firstChild;
    for (let e of this.panels)
      if (e.dom.parentNode == this.dom) {
        for (; t != e.dom; )
          t = rl(t);
        t = t.nextSibling;
      } else
        this.dom.insertBefore(e.dom, t);
    for (; t; )
      t = rl(t);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!(!this.container || this.classes == this.view.themeClasses)) {
      for (let t of this.classes.split(" "))
        t && this.container.classList.remove(t);
      for (let t of (this.classes = this.view.themeClasses).split(" "))
        t && this.container.classList.add(t);
    }
  }
}
function rl(n) {
  let t = n.nextSibling;
  return n.remove(), t;
}
const Bi = /* @__PURE__ */ O.define({
  enables: dh
});
class se extends Le {
  /**
  @internal
  */
  compare(t) {
    return this == t || this.constructor == t.constructor && this.eq(t);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(t) {
    return !1;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(t) {
  }
}
se.prototype.elementClass = "";
se.prototype.toDOM = void 0;
se.prototype.mapMode = mt.TrackBefore;
se.prototype.startSide = se.prototype.endSide = -1;
se.prototype.point = !0;
const kn = /* @__PURE__ */ O.define(), yd = /* @__PURE__ */ O.define(), bd = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => H.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {}
}, vi = /* @__PURE__ */ O.define();
function xd(n) {
  return [ph(), vi.of(Object.assign(Object.assign({}, bd), n))];
}
const ol = /* @__PURE__ */ O.define({
  combine: (n) => n.some((t) => t)
});
function ph(n) {
  return [
    wd
  ];
}
const wd = /* @__PURE__ */ Q.fromClass(class {
  constructor(n) {
    this.view = n, this.prevViewport = n.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = n.state.facet(vi).map((t) => new al(n, t));
    for (let t of this.gutters)
      this.dom.appendChild(t.dom);
    this.fixed = !n.state.facet(ol), this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), n.scrollDOM.insertBefore(this.dom, n.contentDOM);
  }
  update(n) {
    if (this.updateGutters(n)) {
      let t = this.prevViewport, e = n.view.viewport, i = Math.min(t.to, e.to) - Math.max(t.from, e.from);
      this.syncGutters(i < (e.to - e.from) * 0.8);
    }
    n.geometryChanged && (this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px"), this.view.state.facet(ol) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : ""), this.prevViewport = n.view.viewport;
  }
  syncGutters(n) {
    let t = this.dom.nextSibling;
    n && this.dom.remove();
    let e = H.iter(this.view.state.facet(kn), this.view.viewport.from), i = [], s = this.gutters.map((r) => new vd(r, this.view.viewport, -this.view.documentPadding.top));
    for (let r of this.view.viewportLineBlocks)
      if (i.length && (i = []), Array.isArray(r.type)) {
        let o = !0;
        for (let l of r.type)
          if (l.type == gt.Text && o) {
            dr(e, i, l.from);
            for (let a of s)
              a.line(this.view, l, i);
            o = !1;
          } else if (l.widget)
            for (let a of s)
              a.widget(this.view, l);
      } else if (r.type == gt.Text) {
        dr(e, i, r.from);
        for (let o of s)
          o.line(this.view, r, i);
      } else if (r.widget)
        for (let o of s)
          o.widget(this.view, r);
    for (let r of s)
      r.finish();
    n && this.view.scrollDOM.insertBefore(this.dom, t);
  }
  updateGutters(n) {
    let t = n.startState.facet(vi), e = n.state.facet(vi), i = n.docChanged || n.heightChanged || n.viewportChanged || !H.eq(n.startState.facet(kn), n.state.facet(kn), n.view.viewport.from, n.view.viewport.to);
    if (t == e)
      for (let s of this.gutters)
        s.update(n) && (i = !0);
    else {
      i = !0;
      let s = [];
      for (let r of e) {
        let o = t.indexOf(r);
        o < 0 ? s.push(new al(this.view, r)) : (this.gutters[o].update(n), s.push(this.gutters[o]));
      }
      for (let r of this.gutters)
        r.dom.remove(), s.indexOf(r) < 0 && r.destroy();
      for (let r of s)
        this.dom.appendChild(r.dom);
      this.gutters = s;
    }
    return i;
  }
  destroy() {
    for (let n of this.gutters)
      n.destroy();
    this.dom.remove();
  }
}, {
  provide: (n) => D.scrollMargins.of((t) => {
    let e = t.plugin(n);
    return !e || e.gutters.length == 0 || !e.fixed ? null : t.textDirection == Y.LTR ? { left: e.dom.offsetWidth * t.scaleX } : { right: e.dom.offsetWidth * t.scaleX };
  })
});
function ll(n) {
  return Array.isArray(n) ? n : [n];
}
function dr(n, t, e) {
  for (; n.value && n.from <= e; )
    n.from == e && t.push(n.value), n.next();
}
class vd {
  constructor(t, e, i) {
    this.gutter = t, this.height = i, this.i = 0, this.cursor = H.iter(t.markers, e.from);
  }
  addElement(t, e, i) {
    let { gutter: s } = this, r = (e.top - this.height) / t.scaleY, o = e.height / t.scaleY;
    if (this.i == s.elements.length) {
      let l = new mh(t, o, r, i);
      s.elements.push(l), s.dom.appendChild(l.dom);
    } else
      s.elements[this.i].update(t, o, r, i);
    this.height = e.bottom, this.i++;
  }
  line(t, e, i) {
    let s = [];
    dr(this.cursor, s, e.from), i.length && (s = s.concat(i));
    let r = this.gutter.config.lineMarker(t, e, s);
    r && s.unshift(r);
    let o = this.gutter;
    s.length == 0 && !o.config.renderEmptyElements || this.addElement(t, e, s);
  }
  widget(t, e) {
    let i = this.gutter.config.widgetMarker(t, e.widget, e), s = i ? [i] : null;
    for (let r of t.state.facet(yd)) {
      let o = r(t, e.widget, e);
      o && (s || (s = [])).push(o);
    }
    s && this.addElement(t, e, s);
  }
  finish() {
    let t = this.gutter;
    for (; t.elements.length > this.i; ) {
      let e = t.elements.pop();
      t.dom.removeChild(e.dom), e.destroy();
    }
  }
}
class al {
  constructor(t, e) {
    this.view = t, this.config = e, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let i in e.domEventHandlers)
      this.dom.addEventListener(i, (s) => {
        let r = s.target, o;
        if (r != this.dom && this.dom.contains(r)) {
          for (; r.parentNode != this.dom; )
            r = r.parentNode;
          let a = r.getBoundingClientRect();
          o = (a.top + a.bottom) / 2;
        } else
          o = s.clientY;
        let l = t.lineBlockAtHeight(o - t.documentTop);
        e.domEventHandlers[i](t, l, s) && s.preventDefault();
      });
    this.markers = ll(e.markers(t)), e.initialSpacer && (this.spacer = new mh(t, 0, 0, [e.initialSpacer(t)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(t) {
    let e = this.markers;
    if (this.markers = ll(this.config.markers(t.view)), this.spacer && this.config.updateSpacer) {
      let s = this.config.updateSpacer(this.spacer.markers[0], t);
      s != this.spacer.markers[0] && this.spacer.update(t.view, 0, 0, [s]);
    }
    let i = t.view.viewport;
    return !H.eq(this.markers, e, i.from, i.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(t) : !1);
  }
  destroy() {
    for (let t of this.elements)
      t.destroy();
  }
}
class mh {
  constructor(t, e, i, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(t, e, i, s);
  }
  update(t, e, i, s) {
    this.height != e && (this.height = e, this.dom.style.height = e + "px"), this.above != i && (this.dom.style.marginTop = (this.above = i) ? i + "px" : ""), kd(this.markers, s) || this.setMarkers(t, s);
  }
  setMarkers(t, e) {
    let i = "cm-gutterElement", s = this.dom.firstChild;
    for (let r = 0, o = 0; ; ) {
      let l = o, a = r < e.length ? e[r++] : null, c = !1;
      if (a) {
        let h = a.elementClass;
        h && (i += " " + h);
        for (let f = o; f < this.markers.length; f++)
          if (this.markers[f].compare(a)) {
            l = f, c = !0;
            break;
          }
      } else
        l = this.markers.length;
      for (; o < l; ) {
        let h = this.markers[o++];
        if (h.toDOM) {
          h.destroy(s);
          let f = s.nextSibling;
          s.remove(), s = f;
        }
      }
      if (!a)
        break;
      a.toDOM && (c ? s = s.nextSibling : this.dom.insertBefore(a.toDOM(t), s)), c && o++;
    }
    this.dom.className = i, this.markers = e;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function kd(n, t) {
  if (n.length != t.length)
    return !1;
  for (let e = 0; e < n.length; e++)
    if (!n[e].compare(t[e]))
      return !1;
  return !0;
}
const Sd = /* @__PURE__ */ O.define(), Cd = /* @__PURE__ */ O.define(), ze = /* @__PURE__ */ O.define({
  combine(n) {
    return Zt(n, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(t, e) {
        let i = Object.assign({}, t);
        for (let s in e) {
          let r = i[s], o = e[s];
          i[s] = r ? (l, a, c) => r(l, a, c) || o(l, a, c) : o;
        }
        return i;
      }
    });
  }
});
class ys extends se {
  constructor(t) {
    super(), this.number = t;
  }
  eq(t) {
    return this.number == t.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
}
function bs(n, t) {
  return n.state.facet(ze).formatNumber(t, n.state);
}
const Ad = /* @__PURE__ */ vi.compute([ze], (n) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(t) {
    return t.state.facet(Sd);
  },
  lineMarker(t, e, i) {
    return i.some((s) => s.toDOM) ? null : new ys(bs(t, t.state.doc.lineAt(e.from).number));
  },
  widgetMarker: (t, e, i) => {
    for (let s of t.state.facet(Cd)) {
      let r = s(t, e, i);
      if (r)
        return r;
    }
    return null;
  },
  lineMarkerChange: (t) => t.startState.facet(ze) != t.state.facet(ze),
  initialSpacer(t) {
    return new ys(bs(t, hl(t.state.doc.lines)));
  },
  updateSpacer(t, e) {
    let i = bs(e.view, hl(e.view.state.doc.lines));
    return i == t.number ? t : new ys(i);
  },
  domEventHandlers: n.facet(ze).domEventHandlers
}));
function Md(n = {}) {
  return [
    ze.of(n),
    ph(),
    Ad
  ];
}
function hl(n) {
  let t = 9;
  for (; t < n; )
    t = t * 10 + 9;
  return t;
}
const Dd = /* @__PURE__ */ new class extends se {
  constructor() {
    super(...arguments), this.elementClass = "cm-activeLineGutter";
  }
}(), Od = /* @__PURE__ */ kn.compute(["selection"], (n) => {
  let t = [], e = -1;
  for (let i of n.selection.ranges) {
    let s = n.doc.lineAt(i.head).from;
    s > e && (e = s, t.push(Dd.range(s)));
  }
  return H.of(t);
});
function Td() {
  return Od;
}
const Bd = 1024;
let Ld = 0;
class xs {
  constructor(t, e) {
    this.from = t, this.to = e;
  }
}
class N {
  /**
  Create a new node prop type.
  */
  constructor(t = {}) {
    this.id = Ld++, this.perNode = !!t.perNode, this.deserialize = t.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    });
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(t) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    return typeof t != "function" && (t = It.match(t)), (e) => {
      let i = t(e);
      return i === void 0 ? null : [this, i];
    };
  }
}
N.closedBy = new N({ deserialize: (n) => n.split(" ") });
N.openedBy = new N({ deserialize: (n) => n.split(" ") });
N.group = new N({ deserialize: (n) => n.split(" ") });
N.isolate = new N({ deserialize: (n) => {
  if (n && n != "rtl" && n != "ltr" && n != "auto")
    throw new RangeError("Invalid value for isolate: " + n);
  return n || "auto";
} });
N.contextHash = new N({ perNode: !0 });
N.lookAhead = new N({ perNode: !0 });
N.mounted = new N({ perNode: !0 });
class Rn {
  constructor(t, e, i) {
    this.tree = t, this.overlay = e, this.parser = i;
  }
  /**
  @internal
  */
  static get(t) {
    return t && t.props && t.props[N.mounted.id];
  }
}
const Rd = /* @__PURE__ */ Object.create(null);
class It {
  /**
  @internal
  */
  constructor(t, e, i, s = 0) {
    this.name = t, this.props = e, this.id = i, this.flags = s;
  }
  /**
  Define a node type.
  */
  static define(t) {
    let e = t.props && t.props.length ? /* @__PURE__ */ Object.create(null) : Rd, i = (t.top ? 1 : 0) | (t.skipped ? 2 : 0) | (t.error ? 4 : 0) | (t.name == null ? 8 : 0), s = new It(t.name || "", e, t.id, i);
    if (t.props) {
      for (let r of t.props)
        if (Array.isArray(r) || (r = r(s)), r) {
          if (r[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          e[r[0].id] = r[1];
        }
    }
    return s;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(t) {
    return this.props[t.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(t) {
    if (typeof t == "string") {
      if (this.name == t)
        return !0;
      let e = this.prop(N.group);
      return e ? e.indexOf(t) > -1 : !1;
    }
    return this.id == t;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(t) {
    let e = /* @__PURE__ */ Object.create(null);
    for (let i in t)
      for (let s of i.split(" "))
        e[s] = t[i];
    return (i) => {
      for (let s = i.prop(N.group), r = -1; r < (s ? s.length : 0); r++) {
        let o = e[r < 0 ? i.name : s[r]];
        if (o)
          return o;
      }
    };
  }
}
It.none = new It(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
const on = /* @__PURE__ */ new WeakMap(), cl = /* @__PURE__ */ new WeakMap();
var ot;
(function(n) {
  n[n.ExcludeBuffers = 1] = "ExcludeBuffers", n[n.IncludeAnonymous = 2] = "IncludeAnonymous", n[n.IgnoreMounts = 4] = "IgnoreMounts", n[n.IgnoreOverlays = 8] = "IgnoreOverlays";
})(ot || (ot = {}));
class ft {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(t, e, i, s, r) {
    if (this.type = t, this.children = e, this.positions = i, this.length = s, this.props = null, r && r.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [o, l] of r)
        this.props[typeof o == "number" ? o : o.id] = l;
    }
  }
  /**
  @internal
  */
  toString() {
    let t = Rn.get(this);
    if (t && !t.overlay)
      return t.tree.toString();
    let e = "";
    for (let i of this.children) {
      let s = i.toString();
      s && (e && (e += ","), e += s);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (e.length ? "(" + e + ")" : "") : e;
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(t = 0) {
    return new mr(this.topNode, t);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(t, e = 0, i = 0) {
    let s = on.get(this) || this.topNode, r = new mr(s);
    return r.moveTo(t, e), on.set(this, r._tree), r;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new Pt(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(t, e = 0) {
    let i = Li(on.get(this) || this.topNode, t, e, !1);
    return on.set(this, i), i;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(t, e = 0) {
    let i = Li(cl.get(this) || this.topNode, t, e, !0);
    return cl.set(this, i), i;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(t, e = 0) {
    return Id(this, t, e);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(t) {
    let { enter: e, leave: i, from: s = 0, to: r = this.length } = t, o = t.mode || 0, l = (o & ot.IncludeAnonymous) > 0;
    for (let a = this.cursor(o | ot.IncludeAnonymous); ; ) {
      let c = !1;
      if (a.from <= r && a.to >= s && (!l && a.type.isAnonymous || e(a) !== !1)) {
        if (a.firstChild())
          continue;
        c = !0;
      }
      for (; c && i && (l || !a.type.isAnonymous) && i(a), !a.nextSibling(); ) {
        if (!a.parent())
          return;
        c = !0;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(t) {
    return t.perNode ? this.props ? this.props[t.id] : void 0 : this.type.prop(t);
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let t = [];
    if (this.props)
      for (let e in this.props)
        t.push([+e, this.props[e]]);
    return t;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(t = {}) {
    return this.children.length <= 8 ? this : Kr(It.none, this.children, this.positions, 0, this.children.length, 0, this.length, (e, i, s) => new ft(this.type, e, i, s, this.propValues), t.makeTree || ((e, i, s) => new ft(It.none, e, i, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(t) {
    return Nd(t);
  }
}
ft.empty = new ft(It.none, [], [], 0);
class qr {
  constructor(t, e) {
    this.buffer = t, this.index = e;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new qr(this.buffer, this.index);
  }
}
class we {
  /**
  Create a tree buffer.
  */
  constructor(t, e, i) {
    this.buffer = t, this.length = e, this.set = i;
  }
  /**
  @internal
  */
  get type() {
    return It.none;
  }
  /**
  @internal
  */
  toString() {
    let t = [];
    for (let e = 0; e < this.buffer.length; )
      t.push(this.childString(e)), e = this.buffer[e + 3];
    return t.join(",");
  }
  /**
  @internal
  */
  childString(t) {
    let e = this.buffer[t], i = this.buffer[t + 3], s = this.set.types[e], r = s.name;
    if (/\W/.test(r) && !s.isError && (r = JSON.stringify(r)), t += 4, i == t)
      return r;
    let o = [];
    for (; t < i; )
      o.push(this.childString(t)), t = this.buffer[t + 3];
    return r + "(" + o.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(t, e, i, s, r) {
    let { buffer: o } = this, l = -1;
    for (let a = t; a != e && !(gh(r, s, o[a + 1], o[a + 2]) && (l = a, i > 0)); a = o[a + 3])
      ;
    return l;
  }
  /**
  @internal
  */
  slice(t, e, i) {
    let s = this.buffer, r = new Uint16Array(e - t), o = 0;
    for (let l = t, a = 0; l < e; ) {
      r[a++] = s[l++], r[a++] = s[l++] - i;
      let c = r[a++] = s[l++] - i;
      r[a++] = s[l++] - t, o = Math.max(o, c);
    }
    return new we(r, o, this.set);
  }
}
function gh(n, t, e, i) {
  switch (n) {
    case -2:
      return e < t;
    case -1:
      return i >= t && e < t;
    case 0:
      return e < t && i > t;
    case 1:
      return e <= t && i > t;
    case 2:
      return i > t;
    case 4:
      return !0;
  }
}
function Li(n, t, e, i) {
  for (var s; n.from == n.to || (e < 1 ? n.from >= t : n.from > t) || (e > -1 ? n.to <= t : n.to < t); ) {
    let o = !i && n instanceof Pt && n.index < 0 ? null : n.parent;
    if (!o)
      return n;
    n = o;
  }
  let r = i ? 0 : ot.IgnoreOverlays;
  if (i)
    for (let o = n, l = o.parent; l; o = l, l = o.parent)
      o instanceof Pt && o.index < 0 && ((s = l.enter(t, e, r)) === null || s === void 0 ? void 0 : s.from) != o.from && (n = l);
  for (; ; ) {
    let o = n.enter(t, e, r);
    if (!o)
      return n;
    n = o;
  }
}
class yh {
  cursor(t = 0) {
    return new mr(this, t);
  }
  getChild(t, e = null, i = null) {
    let s = fl(this, t, e, i);
    return s.length ? s[0] : null;
  }
  getChildren(t, e = null, i = null) {
    return fl(this, t, e, i);
  }
  resolve(t, e = 0) {
    return Li(this, t, e, !1);
  }
  resolveInner(t, e = 0) {
    return Li(this, t, e, !0);
  }
  matchContext(t) {
    return pr(this.parent, t);
  }
  enterUnfinishedNodesBefore(t) {
    let e = this.childBefore(t), i = this;
    for (; e; ) {
      let s = e.lastChild;
      if (!s || s.to != e.to)
        break;
      s.type.isError && s.from == s.to ? (i = e, e = s.prevSibling) : e = s;
    }
    return i;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
}
class Pt extends yh {
  constructor(t, e, i, s) {
    super(), this._tree = t, this.from = e, this.index = i, this._parent = s;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(t, e, i, s, r = 0) {
    for (let o = this; ; ) {
      for (let { children: l, positions: a } = o._tree, c = e > 0 ? l.length : -1; t != c; t += e) {
        let h = l[t], f = a[t] + o.from;
        if (gh(s, i, f, f + h.length)) {
          if (h instanceof we) {
            if (r & ot.ExcludeBuffers)
              continue;
            let u = h.findChild(0, h.buffer.length, e, i - f, s);
            if (u > -1)
              return new de(new Pd(o, h, t, f), null, u);
          } else if (r & ot.IncludeAnonymous || !h.type.isAnonymous || $r(h)) {
            let u;
            if (!(r & ot.IgnoreMounts) && (u = Rn.get(h)) && !u.overlay)
              return new Pt(u.tree, f, t, o);
            let d = new Pt(h, f, t, o);
            return r & ot.IncludeAnonymous || !d.type.isAnonymous ? d : d.nextChild(e < 0 ? h.children.length - 1 : 0, e, i, s);
          }
        }
      }
      if (r & ot.IncludeAnonymous || !o.type.isAnonymous || (o.index >= 0 ? t = o.index + e : t = e < 0 ? -1 : o._parent._tree.children.length, o = o._parent, !o))
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(t) {
    return this.nextChild(
      0,
      1,
      t,
      2
      /* Side.After */
    );
  }
  childBefore(t) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      t,
      -2
      /* Side.Before */
    );
  }
  enter(t, e, i = 0) {
    let s;
    if (!(i & ot.IgnoreOverlays) && (s = Rn.get(this._tree)) && s.overlay) {
      let r = t - this.from;
      for (let { from: o, to: l } of s.overlay)
        if ((e > 0 ? o <= r : o < r) && (e < 0 ? l >= r : l > r))
          return new Pt(s.tree, s.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, t, e, i);
  }
  nextSignificantParent() {
    let t = this;
    for (; t.type.isAnonymous && t._parent; )
      t = t._parent;
    return t;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
}
function fl(n, t, e, i) {
  let s = n.cursor(), r = [];
  if (!s.firstChild())
    return r;
  if (e != null) {
    for (let o = !1; !o; )
      if (o = s.type.is(e), !s.nextSibling())
        return r;
  }
  for (; ; ) {
    if (i != null && s.type.is(i))
      return r;
    if (s.type.is(t) && r.push(s.node), !s.nextSibling())
      return i == null ? r : [];
  }
}
function pr(n, t, e = t.length - 1) {
  for (let i = n; e >= 0; i = i.parent) {
    if (!i)
      return !1;
    if (!i.type.isAnonymous) {
      if (t[e] && t[e] != i.name)
        return !1;
      e--;
    }
  }
  return !0;
}
class Pd {
  constructor(t, e, i, s) {
    this.parent = t, this.buffer = e, this.index = i, this.start = s;
  }
}
class de extends yh {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(t, e, i) {
    super(), this.context = t, this._parent = e, this.index = i, this.type = t.buffer.set.types[t.buffer.buffer[i]];
  }
  child(t, e, i) {
    let { buffer: s } = this.context, r = s.findChild(this.index + 4, s.buffer[this.index + 3], t, e - this.context.start, i);
    return r < 0 ? null : new de(this.context, this, r);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(t) {
    return this.child(
      1,
      t,
      2
      /* Side.After */
    );
  }
  childBefore(t) {
    return this.child(
      -1,
      t,
      -2
      /* Side.Before */
    );
  }
  enter(t, e, i = 0) {
    if (i & ot.ExcludeBuffers)
      return null;
    let { buffer: s } = this.context, r = s.findChild(this.index + 4, s.buffer[this.index + 3], e > 0 ? 1 : -1, t - this.context.start, e);
    return r < 0 ? null : new de(this.context, this, r);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(t) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + t,
      t,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer: t } = this.context, e = t.buffer[this.index + 3];
    return e < (this._parent ? t.buffer[this._parent.index + 3] : t.buffer.length) ? new de(this.context, this._parent, e) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: t } = this.context, e = this._parent ? this._parent.index + 4 : 0;
    return this.index == e ? this.externalSibling(-1) : new de(this.context, this._parent, t.findChild(
      e,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let t = [], e = [], { buffer: i } = this.context, s = this.index + 4, r = i.buffer[this.index + 3];
    if (r > s) {
      let o = i.buffer[this.index + 1];
      t.push(i.slice(s, r, o)), e.push(0);
    }
    return new ft(this.type, t, e, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function bh(n) {
  if (!n.length)
    return null;
  let t = 0, e = n[0];
  for (let r = 1; r < n.length; r++) {
    let o = n[r];
    (o.from > e.from || o.to < e.to) && (e = o, t = r);
  }
  let i = e instanceof Pt && e.index < 0 ? null : e.parent, s = n.slice();
  return i ? s[t] = i : s.splice(t, 1), new Ed(s, e);
}
class Ed {
  constructor(t, e) {
    this.heads = t, this.node = e;
  }
  get next() {
    return bh(this.heads);
  }
}
function Id(n, t, e) {
  let i = n.resolveInner(t, e), s = null;
  for (let r = i instanceof Pt ? i : i.context.parent; r; r = r.parent)
    if (r.index < 0) {
      let o = r.parent;
      (s || (s = [i])).push(o.resolve(t, e)), r = o;
    } else {
      let o = Rn.get(r.tree);
      if (o && o.overlay && o.overlay[0].from <= t && o.overlay[o.overlay.length - 1].to >= t) {
        let l = new Pt(o.tree, o.overlay[0].from + r.from, -1, r);
        (s || (s = [i])).push(Li(l, t, e, !1));
      }
    }
  return s ? bh(s) : i;
}
class mr {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(t, e = 0) {
    if (this.mode = e, this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, t instanceof Pt)
      this.yieldNode(t);
    else {
      this._tree = t.context.parent, this.buffer = t.context;
      for (let i = t._parent; i; i = i._parent)
        this.stack.unshift(i.index);
      this.bufferNode = t, this.yieldBuf(t.index);
    }
  }
  yieldNode(t) {
    return t ? (this._tree = t, this.type = t.type, this.from = t.from, this.to = t.to, !0) : !1;
  }
  yieldBuf(t, e) {
    this.index = t;
    let { start: i, buffer: s } = this.buffer;
    return this.type = e || s.set.types[s.buffer[t]], this.from = i + s.buffer[t + 1], this.to = i + s.buffer[t + 2], !0;
  }
  /**
  @internal
  */
  yield(t) {
    return t ? t instanceof Pt ? (this.buffer = null, this.yieldNode(t)) : (this.buffer = t.context, this.yieldBuf(t.index, t.type)) : !1;
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(t, e, i) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(t < 0 ? this._tree._tree.children.length - 1 : 0, t, e, i, this.mode));
    let { buffer: s } = this.buffer, r = s.findChild(this.index + 4, s.buffer[this.index + 3], t, e - this.buffer.start, i);
    return r < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(r));
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(t) {
    return this.enterChild(
      1,
      t,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(t) {
    return this.enterChild(
      -1,
      t,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(t, e, i = this.mode) {
    return this.buffer ? i & ot.ExcludeBuffers ? !1 : this.enterChild(1, t, e) : this.yield(this._tree.enter(t, e, i));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & ot.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let t = this.mode & ot.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(t);
  }
  /**
  @internal
  */
  sibling(t) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + t, t, 0, 4, this.mode)) : !1;
    let { buffer: e } = this.buffer, i = this.stack.length - 1;
    if (t < 0) {
      let s = i < 0 ? 0 : this.stack[i] + 4;
      if (this.index != s)
        return this.yieldBuf(e.findChild(
          s,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let s = e.buffer[this.index + 3];
      if (s < (i < 0 ? e.buffer.length : e.buffer[this.stack[i] + 3]))
        return this.yieldBuf(s);
    }
    return i < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + t, t, 0, 4, this.mode)) : !1;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(t) {
    let e, i, { buffer: s } = this;
    if (s) {
      if (t > 0) {
        if (this.index < s.buffer.buffer.length)
          return !1;
      } else
        for (let r = 0; r < this.index; r++)
          if (s.buffer.buffer[r + 3] < this.index)
            return !1;
      ({ index: e, parent: i } = s);
    } else
      ({ index: e, _parent: i } = this._tree);
    for (; i; { index: e, _parent: i } = i)
      if (e > -1)
        for (let r = e + t, o = t < 0 ? -1 : i._tree.children.length; r != o; r += t) {
          let l = i._tree.children[r];
          if (this.mode & ot.IncludeAnonymous || l instanceof we || !l.type.isAnonymous || $r(l))
            return !1;
        }
    return !0;
  }
  move(t, e) {
    if (e && this.enterChild(
      t,
      0,
      4
      /* Side.DontCare */
    ))
      return !0;
    for (; ; ) {
      if (this.sibling(t))
        return !0;
      if (this.atLastNode(t) || !this.parent())
        return !1;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(t = !0) {
    return this.move(1, t);
  }
  /**
  Move to the next node in a last-to-first pre-order traversal. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(t = !0) {
    return this.move(-1, t);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(t, e = 0) {
    for (; (this.from == this.to || (e < 1 ? this.from >= t : this.from > t) || (e > -1 ? this.to <= t : this.to < t)) && this.parent(); )
      ;
    for (; this.enterChild(1, t, e); )
      ;
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let t = this.bufferNode, e = null, i = 0;
    if (t && t.context == this.buffer)
      t: for (let s = this.index, r = this.stack.length; r >= 0; ) {
        for (let o = t; o; o = o._parent)
          if (o.index == s) {
            if (s == this.index)
              return o;
            e = o, i = r + 1;
            break t;
          }
        s = this.stack[--r];
      }
    for (let s = i; s < this.stack.length; s++)
      e = new de(this.buffer, e, this.stack[s]);
    return this.bufferNode = new de(this.buffer, e, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(t, e) {
    for (let i = 0; ; ) {
      let s = !1;
      if (this.type.isAnonymous || t(this) !== !1) {
        if (this.firstChild()) {
          i++;
          continue;
        }
        this.type.isAnonymous || (s = !0);
      }
      for (; ; ) {
        if (s && e && e(this), s = this.type.isAnonymous, !i)
          return;
        if (this.nextSibling())
          break;
        this.parent(), i--, s = !0;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(t) {
    if (!this.buffer)
      return pr(this.node.parent, t);
    let { buffer: e } = this.buffer, { types: i } = e.set;
    for (let s = t.length - 1, r = this.stack.length - 1; s >= 0; r--) {
      if (r < 0)
        return pr(this._tree, t, s);
      let o = i[e.buffer[this.stack[r]]];
      if (!o.isAnonymous) {
        if (t[s] && t[s] != o.name)
          return !1;
        s--;
      }
    }
    return !0;
  }
}
function $r(n) {
  return n.children.some((t) => t instanceof we || !t.type.isAnonymous || $r(t));
}
function Nd(n) {
  var t;
  let { buffer: e, nodeSet: i, maxBufferLength: s = Bd, reused: r = [], minRepeatType: o = i.types.length } = n, l = Array.isArray(e) ? new qr(e, e.length) : e, a = i.types, c = 0, h = 0;
  function f(v, C, M, P, I, q) {
    let { id: E, start: L, end: z, size: W } = l, j = h, pt = c;
    for (; W < 0; )
      if (l.next(), W == -1) {
        let ee = r[E];
        M.push(ee), P.push(L - v);
        return;
      } else if (W == -3) {
        c = E;
        return;
      } else if (W == -4) {
        h = E;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${W}`);
    let kt = a[E], Wt, it, Dt = L - v;
    if (z - L <= s && (it = y(l.pos - C, I))) {
      let ee = new Uint16Array(it.size - it.skip), Ot = l.pos - it.size, zt = ee.length;
      for (; l.pos > Ot; )
        zt = b(it.start, ee, zt);
      Wt = new we(ee, z - it.start, i), Dt = it.start - v;
    } else {
      let ee = l.pos - W;
      l.next();
      let Ot = [], zt = [], Ce = E >= o ? E : -1, Fe = 0, ji = z;
      for (; l.pos > ee; )
        Ce >= 0 && l.id == Ce && l.size >= 0 ? (l.end <= ji - s && (p(Ot, zt, L, Fe, l.end, ji, Ce, j, pt), Fe = Ot.length, ji = l.end), l.next()) : q > 2500 ? u(L, ee, Ot, zt) : f(L, ee, Ot, zt, Ce, q + 1);
      if (Ce >= 0 && Fe > 0 && Fe < Ot.length && p(Ot, zt, L, Fe, L, ji, Ce, j, pt), Ot.reverse(), zt.reverse(), Ce > -1 && Fe > 0) {
        let ro = d(kt, pt);
        Wt = Kr(kt, Ot, zt, 0, Ot.length, 0, z - L, ro, ro);
      } else
        Wt = g(kt, Ot, zt, z - L, j - z, pt);
    }
    M.push(Wt), P.push(Dt);
  }
  function u(v, C, M, P) {
    let I = [], q = 0, E = -1;
    for (; l.pos > C; ) {
      let { id: L, start: z, end: W, size: j } = l;
      if (j > 4)
        l.next();
      else {
        if (E > -1 && z < E)
          break;
        E < 0 && (E = W - s), I.push(L, z, W), q++, l.next();
      }
    }
    if (q) {
      let L = new Uint16Array(q * 4), z = I[I.length - 2];
      for (let W = I.length - 3, j = 0; W >= 0; W -= 3)
        L[j++] = I[W], L[j++] = I[W + 1] - z, L[j++] = I[W + 2] - z, L[j++] = j;
      M.push(new we(L, I[2] - z, i)), P.push(z - v);
    }
  }
  function d(v, C) {
    return (M, P, I) => {
      let q = 0, E = M.length - 1, L, z;
      if (E >= 0 && (L = M[E]) instanceof ft) {
        if (!E && L.type == v && L.length == I)
          return L;
        (z = L.prop(N.lookAhead)) && (q = P[E] + L.length + z);
      }
      return g(v, M, P, I, q, C);
    };
  }
  function p(v, C, M, P, I, q, E, L, z) {
    let W = [], j = [];
    for (; v.length > P; )
      W.push(v.pop()), j.push(C.pop() + M - I);
    v.push(g(i.types[E], W, j, q - I, L - q, z)), C.push(I - M);
  }
  function g(v, C, M, P, I, q, E) {
    if (q) {
      let L = [N.contextHash, q];
      E = E ? [L].concat(E) : [L];
    }
    if (I > 25) {
      let L = [N.lookAhead, I];
      E = E ? [L].concat(E) : [L];
    }
    return new ft(v, C, M, P, E);
  }
  function y(v, C) {
    let M = l.fork(), P = 0, I = 0, q = 0, E = M.end - s, L = { size: 0, start: 0, skip: 0 };
    t: for (let z = M.pos - v; M.pos > z; ) {
      let W = M.size;
      if (M.id == C && W >= 0) {
        L.size = P, L.start = I, L.skip = q, q += 4, P += 4, M.next();
        continue;
      }
      let j = M.pos - W;
      if (W < 0 || j < z || M.start < E)
        break;
      let pt = M.id >= o ? 4 : 0, kt = M.start;
      for (M.next(); M.pos > j; ) {
        if (M.size < 0)
          if (M.size == -3)
            pt += 4;
          else
            break t;
        else M.id >= o && (pt += 4);
        M.next();
      }
      I = kt, P += W, q += pt;
    }
    return (C < 0 || P == v) && (L.size = P, L.start = I, L.skip = q), L.size > 4 ? L : void 0;
  }
  function b(v, C, M) {
    let { id: P, start: I, end: q, size: E } = l;
    if (l.next(), E >= 0 && P < o) {
      let L = M;
      if (E > 4) {
        let z = l.pos - (E - 4);
        for (; l.pos > z; )
          M = b(v, C, M);
      }
      C[--M] = L, C[--M] = q - v, C[--M] = I - v, C[--M] = P;
    } else E == -3 ? c = P : E == -4 && (h = P);
    return M;
  }
  let w = [], k = [];
  for (; l.pos > 0; )
    f(n.start || 0, n.bufferStart || 0, w, k, -1, 0);
  let S = (t = n.length) !== null && t !== void 0 ? t : w.length ? k[0] + w[0].length : 0;
  return new ft(a[n.topID], w.reverse(), k.reverse(), S);
}
const ul = /* @__PURE__ */ new WeakMap();
function Sn(n, t) {
  if (!n.isAnonymous || t instanceof we || t.type != n)
    return 1;
  let e = ul.get(t);
  if (e == null) {
    e = 1;
    for (let i of t.children) {
      if (i.type != n || !(i instanceof ft)) {
        e = 1;
        break;
      }
      e += Sn(n, i);
    }
    ul.set(t, e);
  }
  return e;
}
function Kr(n, t, e, i, s, r, o, l, a) {
  let c = 0;
  for (let p = i; p < s; p++)
    c += Sn(n, t[p]);
  let h = Math.ceil(
    c * 1.5 / 8
    /* Balance.BranchFactor */
  ), f = [], u = [];
  function d(p, g, y, b, w) {
    for (let k = y; k < b; ) {
      let S = k, v = g[k], C = Sn(n, p[k]);
      for (k++; k < b; k++) {
        let M = Sn(n, p[k]);
        if (C + M >= h)
          break;
        C += M;
      }
      if (k == S + 1) {
        if (C > h) {
          let M = p[S];
          d(M.children, M.positions, 0, M.children.length, g[S] + w);
          continue;
        }
        f.push(p[S]);
      } else {
        let M = g[k - 1] + p[k - 1].length - v;
        f.push(Kr(n, p, g, S, k, v, M, null, a));
      }
      u.push(v + w - r);
    }
  }
  return d(t, e, i, s, 0), (l || a)(f, u, o);
}
class Be {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(t, e, i, s, r = !1, o = !1) {
    this.from = t, this.to = e, this.tree = i, this.offset = s, this.open = (r ? 1 : 0) | (o ? 2 : 0);
  }
  /**
  Whether the start of the fragment represents the start of a
  parse, or the end of a change. (In the second case, it may not
  be safe to reuse some nodes at the start, depending on the
  parsing algorithm.)
  */
  get openStart() {
    return (this.open & 1) > 0;
  }
  /**
  Whether the end of the fragment represents the end of a
  full-document parse, or the start of a change.
  */
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /**
  Create a set of fragments from a freshly parsed tree, or update
  an existing set of fragments by replacing the ones that overlap
  with a tree with content from the new tree. When `partial` is
  true, the parse is treated as incomplete, and the resulting
  fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  true.
  */
  static addTree(t, e = [], i = !1) {
    let s = [new Be(0, t.length, t, 0, !1, i)];
    for (let r of e)
      r.to > t.length && s.push(r);
    return s;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(t, e, i = 128) {
    if (!e.length)
      return t;
    let s = [], r = 1, o = t.length ? t[0] : null;
    for (let l = 0, a = 0, c = 0; ; l++) {
      let h = l < e.length ? e[l] : null, f = h ? h.fromA : 1e9;
      if (f - a >= i)
        for (; o && o.from < f; ) {
          let u = o;
          if (a >= u.from || f <= u.to || c) {
            let d = Math.max(u.from, a) - c, p = Math.min(u.to, f) - c;
            u = d >= p ? null : new Be(d, p, u.tree, u.offset + c, l > 0, !!h);
          }
          if (u && s.push(u), o.to > f)
            break;
          o = r < t.length ? t[r++] : null;
        }
      if (!h)
        break;
      a = h.toA, c = h.toA - h.toB;
    }
    return s;
  }
}
class Fd {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(t, e, i) {
    return typeof t == "string" && (t = new Hd(t)), i = i ? i.length ? i.map((s) => new xs(s.from, s.to)) : [new xs(0, 0)] : [new xs(0, t.length)], this.createParse(t, e || [], i);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(t, e, i) {
    let s = this.startParse(t, e, i);
    for (; ; ) {
      let r = s.advance();
      if (r)
        return r;
    }
  }
}
class Hd {
  constructor(t) {
    this.string = t;
  }
  get length() {
    return this.string.length;
  }
  chunk(t) {
    return this.string.slice(t);
  }
  get lineChunks() {
    return !1;
  }
  read(t, e) {
    return this.string.slice(t, e);
  }
}
new N({ perNode: !0 });
let Vd = 0;
class Tt {
  /**
  @internal
  */
  constructor(t, e, i, s) {
    this.name = t, this.set = e, this.base = i, this.modified = s, this.id = Vd++;
  }
  toString() {
    let { name: t } = this;
    for (let e of this.modified)
      e.name && (t = `${e.name}(${t})`);
    return t;
  }
  static define(t, e) {
    let i = typeof t == "string" ? t : "?";
    if (t instanceof Tt && (e = t), e != null && e.base)
      throw new Error("Can not derive from a modified tag");
    let s = new Tt(i, [], null, []);
    if (s.set.push(s), e)
      for (let r of e.set)
        s.set.push(r);
    return s;
  }
  /**
  Define a tag _modifier_, which is a function that, given a tag,
  will return a tag that is a subtag of the original. Applying the
  same modifier to a twice tag will return the same value (`m1(t1)
  == m1(t1)`) and applying multiple modifiers will, regardless or
  order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  
  When multiple modifiers are applied to a given base tag, each
  smaller set of modifiers is registered as a parent, so that for
  example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  `m1(m3(t1)`, and so on.
  */
  static defineModifier(t) {
    let e = new Pn(t);
    return (i) => i.modified.indexOf(e) > -1 ? i : Pn.get(i.base || i, i.modified.concat(e).sort((s, r) => s.id - r.id));
  }
}
let Wd = 0;
class Pn {
  constructor(t) {
    this.name = t, this.instances = [], this.id = Wd++;
  }
  static get(t, e) {
    if (!e.length)
      return t;
    let i = e[0].instances.find((l) => l.base == t && zd(e, l.modified));
    if (i)
      return i;
    let s = [], r = new Tt(t.name, s, t, e);
    for (let l of e)
      l.instances.push(r);
    let o = qd(e);
    for (let l of t.set)
      if (!l.modified.length)
        for (let a of o)
          s.push(Pn.get(l, a));
    return r;
  }
}
function zd(n, t) {
  return n.length == t.length && n.every((e, i) => e == t[i]);
}
function qd(n) {
  let t = [[]];
  for (let e = 0; e < n.length; e++)
    for (let i = 0, s = t.length; i < s; i++)
      t.push(t[i].concat(n[e]));
  return t.sort((e, i) => i.length - e.length);
}
function $d(n) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let e in n) {
    let i = n[e];
    Array.isArray(i) || (i = [i]);
    for (let s of e.split(" "))
      if (s) {
        let r = [], o = 2, l = s;
        for (let f = 0; ; ) {
          if (l == "..." && f > 0 && f + 3 == s.length) {
            o = 1;
            break;
          }
          let u = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);
          if (!u)
            throw new RangeError("Invalid path: " + s);
          if (r.push(u[0] == "*" ? "" : u[0][0] == '"' ? JSON.parse(u[0]) : u[0]), f += u[0].length, f == s.length)
            break;
          let d = s[f++];
          if (f == s.length && d == "!") {
            o = 0;
            break;
          }
          if (d != "/")
            throw new RangeError("Invalid path: " + s);
          l = s.slice(f);
        }
        let a = r.length - 1, c = r[a];
        if (!c)
          throw new RangeError("Invalid path: " + s);
        let h = new En(i, o, a > 0 ? r.slice(0, a) : null);
        t[c] = h.sort(t[c]);
      }
  }
  return xh.add(t);
}
const xh = new N();
class En {
  constructor(t, e, i, s) {
    this.tags = t, this.mode = e, this.context = i, this.next = s;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(t) {
    return !t || t.depth < this.depth ? (this.next = t, this) : (t.next = this.sort(t.next), t);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
En.empty = new En([], 2, null);
function wh(n, t) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let r of n)
    if (!Array.isArray(r.tag))
      e[r.tag.id] = r.class;
    else
      for (let o of r.tag)
        e[o.id] = r.class;
  let { scope: i, all: s = null } = t || {};
  return {
    style: (r) => {
      let o = s;
      for (let l of r)
        for (let a of l.set) {
          let c = e[a.id];
          if (c) {
            o = o ? o + " " + c : c;
            break;
          }
        }
      return o;
    },
    scope: i
  };
}
function Kd(n, t) {
  let e = null;
  for (let i of n) {
    let s = i.style(t);
    s && (e = e ? e + " " + s : s);
  }
  return e;
}
function jd(n, t, e, i = 0, s = n.length) {
  let r = new Ud(i, Array.isArray(t) ? t : [t], e);
  r.highlightRange(n.cursor(), i, s, "", r.highlighters), r.flush(s);
}
class Ud {
  constructor(t, e, i) {
    this.at = t, this.highlighters = e, this.span = i, this.class = "";
  }
  startSpan(t, e) {
    e != this.class && (this.flush(t), t > this.at && (this.at = t), this.class = e);
  }
  flush(t) {
    t > this.at && this.class && this.span(this.at, t, this.class);
  }
  highlightRange(t, e, i, s, r) {
    let { type: o, from: l, to: a } = t;
    if (l >= i || a <= e)
      return;
    o.isTop && (r = this.highlighters.filter((d) => !d.scope || d.scope(o)));
    let c = s, h = Gd(t) || En.empty, f = Kd(r, h.tags);
    if (f && (c && (c += " "), c += f, h.mode == 1 && (s += (s ? " " : "") + f)), this.startSpan(Math.max(e, l), c), h.opaque)
      return;
    let u = t.tree && t.tree.prop(N.mounted);
    if (u && u.overlay) {
      let d = t.node.enter(u.overlay[0].from + l, 1), p = this.highlighters.filter((y) => !y.scope || y.scope(u.tree.type)), g = t.firstChild();
      for (let y = 0, b = l; ; y++) {
        let w = y < u.overlay.length ? u.overlay[y] : null, k = w ? w.from + l : a, S = Math.max(e, b), v = Math.min(i, k);
        if (S < v && g)
          for (; t.from < v && (this.highlightRange(t, S, v, s, r), this.startSpan(Math.min(v, t.to), c), !(t.to >= k || !t.nextSibling())); )
            ;
        if (!w || k > i)
          break;
        b = w.to + l, b > e && (this.highlightRange(d.cursor(), Math.max(e, w.from + l), Math.min(i, b), "", p), this.startSpan(Math.min(i, b), c));
      }
      g && t.parent();
    } else if (t.firstChild()) {
      u && (s = "");
      do
        if (!(t.to <= e)) {
          if (t.from >= i)
            break;
          this.highlightRange(t, e, i, s, r), this.startSpan(Math.min(i, t.to), c);
        }
      while (t.nextSibling());
      t.parent();
    }
  }
}
function Gd(n) {
  let t = n.type.prop(xh);
  for (; t && t.context && !n.matchContext(t.context); )
    t = t.next;
  return t || null;
}
const A = Tt.define, ln = A(), oe = A(), dl = A(oe), pl = A(oe), le = A(), an = A(le), ws = A(le), jt = A(), Ae = A(jt), $t = A(), Kt = A(), gr = A(), ai = A(gr), hn = A(), m = {
  /**
  A comment.
  */
  comment: ln,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: A(ln),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: A(ln),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: A(ln),
  /**
  Any kind of identifier.
  */
  name: oe,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: A(oe),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: dl,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: A(dl),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: pl,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: A(pl),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: A(oe),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: A(oe),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: A(oe),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: A(oe),
  /**
  A literal value.
  */
  literal: le,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: an,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: A(an),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: A(an),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: A(an),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: ws,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: A(ws),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: A(ws),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: A(le),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: A(le),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: A(le),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: A(le),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: A(le),
  /**
  A language keyword.
  */
  keyword: $t,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: A($t),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: A($t),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: A($t),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: A($t),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: A($t),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: A($t),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: A($t),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: A($t),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: A($t),
  /**
  An operator.
  */
  operator: Kt,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: A(Kt),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: A(Kt),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: A(Kt),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: A(Kt),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: A(Kt),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: A(Kt),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: A(Kt),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: A(Kt),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: A(Kt),
  /**
  Program or markup punctuation.
  */
  punctuation: gr,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: A(gr),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: ai,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: A(ai),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: A(ai),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: A(ai),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: A(ai),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: jt,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: Ae,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: A(Ae),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: A(Ae),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: A(Ae),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: A(Ae),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: A(Ae),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: A(Ae),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: A(jt),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: A(jt),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: A(jt),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: A(jt),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: A(jt),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: A(jt),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: A(jt),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: A(jt),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: A(),
  /**
  Deleted text.
  */
  deleted: A(),
  /**
  Changed text.
  */
  changed: A(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: A(),
  /**
  Metadata or meta-instruction.
  */
  meta: hn,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: A(hn),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: A(hn),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: A(hn),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: Tt.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: Tt.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: Tt.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: Tt.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: Tt.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: Tt.defineModifier("special")
};
for (let n in m) {
  let t = m[n];
  t instanceof Tt && (t.name = n);
}
wh([
  { tag: m.link, class: "tok-link" },
  { tag: m.heading, class: "tok-heading" },
  { tag: m.emphasis, class: "tok-emphasis" },
  { tag: m.strong, class: "tok-strong" },
  { tag: m.keyword, class: "tok-keyword" },
  { tag: m.atom, class: "tok-atom" },
  { tag: m.bool, class: "tok-bool" },
  { tag: m.url, class: "tok-url" },
  { tag: m.labelName, class: "tok-labelName" },
  { tag: m.inserted, class: "tok-inserted" },
  { tag: m.deleted, class: "tok-deleted" },
  { tag: m.literal, class: "tok-literal" },
  { tag: m.string, class: "tok-string" },
  { tag: m.number, class: "tok-number" },
  { tag: [m.regexp, m.escape, m.special(m.string)], class: "tok-string2" },
  { tag: m.variableName, class: "tok-variableName" },
  { tag: m.local(m.variableName), class: "tok-variableName tok-local" },
  { tag: m.definition(m.variableName), class: "tok-variableName tok-definition" },
  { tag: m.special(m.variableName), class: "tok-variableName2" },
  { tag: m.definition(m.propertyName), class: "tok-propertyName tok-definition" },
  { tag: m.typeName, class: "tok-typeName" },
  { tag: m.namespace, class: "tok-namespace" },
  { tag: m.className, class: "tok-className" },
  { tag: m.macroName, class: "tok-macroName" },
  { tag: m.propertyName, class: "tok-propertyName" },
  { tag: m.operator, class: "tok-operator" },
  { tag: m.comment, class: "tok-comment" },
  { tag: m.meta, class: "tok-meta" },
  { tag: m.invalid, class: "tok-invalid" },
  { tag: m.punctuation, class: "tok-punctuation" }
]);
var vs;
const gi = /* @__PURE__ */ new N(), Yd = /* @__PURE__ */ new N();
class Yt {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(t, e, i = [], s = "") {
    this.data = t, this.name = s, F.prototype.hasOwnProperty("tree") || Object.defineProperty(F.prototype, "tree", { get() {
      return ut(this);
    } }), this.parser = e, this.extension = [
      ve.of(this),
      F.languageData.of((r, o, l) => {
        let a = ml(r, o, l), c = a.type.prop(gi);
        if (!c)
          return [];
        let h = r.facet(c), f = a.type.prop(Yd);
        if (f) {
          let u = a.resolve(o - a.from, l);
          for (let d of f)
            if (d.test(u, r)) {
              let p = r.facet(d.facet);
              return d.type == "replace" ? p : p.concat(h);
            }
        }
        return h;
      })
    ].concat(i);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(t, e, i = -1) {
    return ml(t, e, i).type.prop(gi) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(t) {
    let e = t.facet(ve);
    if ((e == null ? void 0 : e.data) == this.data)
      return [{ from: 0, to: t.doc.length }];
    if (!e || !e.allowsNesting)
      return [];
    let i = [], s = (r, o) => {
      if (r.prop(gi) == this.data) {
        i.push({ from: o, to: o + r.length });
        return;
      }
      let l = r.prop(N.mounted);
      if (l) {
        if (l.tree.prop(gi) == this.data) {
          if (l.overlay)
            for (let a of l.overlay)
              i.push({ from: a.from + o, to: a.to + o });
          else
            i.push({ from: o, to: o + r.length });
          return;
        } else if (l.overlay) {
          let a = i.length;
          if (s(l.tree, l.overlay[0].from + o), i.length > a)
            return;
        }
      }
      for (let a = 0; a < r.children.length; a++) {
        let c = r.children[a];
        c instanceof ft && s(c, r.positions[a] + o);
      }
    };
    return s(ut(t), 0), i;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
Yt.setState = /* @__PURE__ */ R.define();
function ml(n, t, e) {
  let i = n.facet(ve), s = ut(n).topNode;
  if (!i || i.allowsNesting)
    for (let r = s; r; r = r.enter(t, e, ot.ExcludeBuffers))
      r.type.isTop && (s = r);
  return s;
}
function ut(n) {
  let t = n.field(Yt.state, !1);
  return t ? t.tree : ft.empty;
}
class _d {
  /**
  Create an input object for the given document.
  */
  constructor(t) {
    this.doc = t, this.cursorPos = 0, this.string = "", this.cursor = t.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(t) {
    return this.string = this.cursor.next(t - this.cursorPos).value, this.cursorPos = t + this.string.length, this.cursorPos - this.string.length;
  }
  chunk(t) {
    return this.syncTo(t), this.string;
  }
  get lineChunks() {
    return !0;
  }
  read(t, e) {
    let i = this.cursorPos - this.string.length;
    return t < i || e >= this.cursorPos ? this.doc.sliceString(t, e) : this.string.slice(t - i, e - i);
  }
}
let hi = null;
class In {
  constructor(t, e, i = [], s, r, o, l, a) {
    this.parser = t, this.state = e, this.fragments = i, this.tree = s, this.treeLen = r, this.viewport = o, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new In(t, e, [], ft.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new _d(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(t, e) {
    return e != null && e >= this.state.doc.length && (e = void 0), this.tree != ft.empty && this.isDone(e ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var i;
      if (typeof t == "number") {
        let s = Date.now() + t;
        t = () => Date.now() > s;
      }
      for (this.parse || (this.parse = this.startParse()), e != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > e) && e < this.state.doc.length && this.parse.stopAt(e); ; ) {
        let s = this.parse.advance();
        if (s)
          if (this.fragments = this.withoutTempSkipped(Be.addTree(s, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (i = this.parse.stoppedAt) !== null && i !== void 0 ? i : this.state.doc.length, this.tree = s, this.parse = null, this.treeLen < (e ?? this.state.doc.length))
            this.parse = this.startParse();
          else
            return !0;
        if (t())
          return !1;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let t, e;
    this.parse && (t = this.parse.parsedPos) >= this.treeLen && ((this.parse.stoppedAt == null || this.parse.stoppedAt > t) && this.parse.stopAt(t), this.withContext(() => {
      for (; !(e = this.parse.advance()); )
        ;
    }), this.treeLen = t, this.tree = e, this.fragments = this.withoutTempSkipped(Be.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(t) {
    let e = hi;
    hi = this;
    try {
      return t();
    } finally {
      hi = e;
    }
  }
  withoutTempSkipped(t) {
    for (let e; e = this.tempSkipped.pop(); )
      t = gl(t, e.from, e.to);
    return t;
  }
  /**
  @internal
  */
  changes(t, e) {
    let { fragments: i, tree: s, treeLen: r, viewport: o, skipped: l } = this;
    if (this.takeTree(), !t.empty) {
      let a = [];
      if (t.iterChangedRanges((c, h, f, u) => a.push({ fromA: c, toA: h, fromB: f, toB: u })), i = Be.applyChanges(i, a), s = ft.empty, r = 0, o = { from: t.mapPos(o.from, -1), to: t.mapPos(o.to, 1) }, this.skipped.length) {
        l = [];
        for (let c of this.skipped) {
          let h = t.mapPos(c.from, 1), f = t.mapPos(c.to, -1);
          h < f && l.push({ from: h, to: f });
        }
      }
    }
    return new In(this.parser, e, i, s, r, o, l, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(t) {
    if (this.viewport.from == t.from && this.viewport.to == t.to)
      return !1;
    this.viewport = t;
    let e = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from: s, to: r } = this.skipped[i];
      s < t.to && r > t.from && (this.fragments = gl(this.fragments, s, r), this.skipped.splice(i--, 1));
    }
    return this.skipped.length >= e ? !1 : (this.reset(), !0);
  }
  /**
  @internal
  */
  reset() {
    this.parse && (this.takeTree(), this.parse = null);
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(t, e) {
    this.skipped.push({ from: t, to: e });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(t) {
    return new class extends Fd {
      createParse(e, i, s) {
        let r = s[0].from, o = s[s.length - 1].to;
        return {
          parsedPos: r,
          advance() {
            let a = hi;
            if (a) {
              for (let c of s)
                a.tempSkipped.push(c);
              t && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, t]) : t);
            }
            return this.parsedPos = o, new ft(It.none, [], [], o - r);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
      }
    }();
  }
  /**
  @internal
  */
  isDone(t) {
    t = Math.min(t, this.state.doc.length);
    let e = this.fragments;
    return this.treeLen >= t && e.length && e[0].from == 0 && e[0].to >= t;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return hi;
  }
}
function gl(n, t, e) {
  return Be.applyChanges(n, [{ fromA: t, toA: e, fromB: t, toB: e }]);
}
class Ze {
  constructor(t) {
    this.context = t, this.tree = t.tree;
  }
  apply(t) {
    if (!t.docChanged && this.tree == this.context.tree)
      return this;
    let e = this.context.changes(t.changes, t.state), i = this.context.treeLen == t.startState.doc.length ? void 0 : Math.max(t.changes.mapPos(this.context.treeLen), e.viewport.to);
    return e.work(20, i) || e.takeTree(), new Ze(e);
  }
  static init(t) {
    let e = Math.min(3e3, t.doc.length), i = In.create(t.facet(ve).parser, t, { from: 0, to: e });
    return i.work(20, e) || i.takeTree(), new Ze(i);
  }
}
Yt.state = /* @__PURE__ */ at.define({
  create: Ze.init,
  update(n, t) {
    for (let e of t.effects)
      if (e.is(Yt.setState))
        return e.value;
    return t.startState.facet(ve) != t.state.facet(ve) ? Ze.init(t.state) : n.apply(t);
  }
});
let vh = (n) => {
  let t = setTimeout(
    () => n(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(t);
};
typeof requestIdleCallback < "u" && (vh = (n) => {
  let t = -1, e = setTimeout(
    () => {
      t = requestIdleCallback(n, {
        timeout: 400
        /* Work.MinPause */
      });
    },
    100
    /* Work.MinPause */
  );
  return () => t < 0 ? clearTimeout(e) : cancelIdleCallback(t);
});
const ks = typeof navigator < "u" && (!((vs = navigator.scheduling) === null || vs === void 0) && vs.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Jd = /* @__PURE__ */ Q.fromClass(class {
  constructor(t) {
    this.view = t, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(t) {
    let e = this.view.state.field(Yt.state).context;
    (e.updateViewport(t.view.viewport) || this.view.viewport.to > e.treeLen) && this.scheduleWork(), (t.docChanged || t.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(e);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: t } = this.view, e = t.field(Yt.state);
    (e.tree != e.context.tree || !e.context.isDone(t.doc.length)) && (this.working = vh(this.work));
  }
  work(t) {
    this.working = null;
    let e = Date.now();
    if (this.chunkEnd < e && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = e + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: s } } = this.view, r = i.field(Yt.state);
    if (r.tree == r.context.tree && r.context.isDone(
      s + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let o = Date.now() + Math.min(this.chunkBudget, 100, t && !ks ? Math.max(25, t.timeRemaining() - 5) : 1e9), l = r.context.treeLen < s && i.doc.length > s + 1e3, a = r.context.work(() => ks && ks() || Date.now() > o, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - e, (a || this.chunkBudget <= 0) && (r.context.takeTree(), this.view.dispatch({ effects: Yt.setState.of(new Ze(r.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(r.context);
  }
  checkAsyncSchedule(t) {
    t.scheduleOn && (this.workScheduled++, t.scheduleOn.then(() => this.scheduleWork()).catch((e) => wt(this.view.state, e)).then(() => this.workScheduled--), t.scheduleOn = null);
  }
  destroy() {
    this.working && this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
}), ve = /* @__PURE__ */ O.define({
  combine(n) {
    return n.length ? n[0] : null;
  },
  enables: (n) => [
    Yt.state,
    Jd,
    D.contentAttributes.compute([n], (t) => {
      let e = t.facet(n);
      return e && e.name ? { "data-language": e.name } : {};
    })
  ]
}), Xd = /* @__PURE__ */ O.define(), jr = /* @__PURE__ */ O.define({
  combine: (n) => {
    if (!n.length)
      return "  ";
    let t = n[0];
    if (!t || /\S/.test(t) || Array.from(t).some((e) => e != t[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(n[0]));
    return t;
  }
});
function Nn(n) {
  let t = n.facet(jr);
  return t.charCodeAt(0) == 9 ? n.tabSize * t.length : t.length;
}
function Ri(n, t) {
  let e = "", i = n.tabSize, s = n.facet(jr)[0];
  if (s == "	") {
    for (; t >= i; )
      e += "	", t -= i;
    s = " ";
  }
  for (let r = 0; r < t; r++)
    e += s;
  return e;
}
function Ur(n, t) {
  n instanceof F && (n = new ts(n));
  for (let i of n.state.facet(Xd)) {
    let s = i(n, t);
    if (s !== void 0)
      return s;
  }
  let e = ut(n.state);
  return e.length >= t ? Zd(n, e, t) : null;
}
class ts {
  /**
  Create an indent context.
  */
  constructor(t, e = {}) {
    this.state = t, this.options = e, this.unit = Nn(t);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(t, e = 1) {
    let i = this.state.doc.lineAt(t), { simulateBreak: s, simulateDoubleBreak: r } = this.options;
    return s != null && s >= i.from && s <= i.to ? r && s == t ? { text: "", from: t } : (e < 0 ? s < t : s <= t) ? { text: i.text.slice(s - i.from), from: s } : { text: i.text.slice(0, s - i.from), from: i.from } : i;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(t, e = 1) {
    if (this.options.simulateDoubleBreak && t == this.options.simulateBreak)
      return "";
    let { text: i, from: s } = this.lineAt(t, e);
    return i.slice(t - s, Math.min(i.length, t + 100 - s));
  }
  /**
  Find the column for the given position.
  */
  column(t, e = 1) {
    let { text: i, from: s } = this.lineAt(t, e), r = this.countColumn(i, t - s), o = this.options.overrideIndentation ? this.options.overrideIndentation(s) : -1;
    return o > -1 && (r += o - this.countColumn(i, i.search(/\S|$/))), r;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(t, e = t.length) {
    return ii(t, this.state.tabSize, e);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(t, e = 1) {
    let { text: i, from: s } = this.lineAt(t, e), r = this.options.overrideIndentation;
    if (r) {
      let o = r(s);
      if (o > -1)
        return o;
    }
    return this.countColumn(i, i.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const Qd = /* @__PURE__ */ new N();
function Zd(n, t, e) {
  let i = t.resolveStack(e), s = i.node.enterUnfinishedNodesBefore(e);
  if (s != i.node) {
    let r = [];
    for (let o = s; o != i.node; o = o.parent)
      r.push(o);
    for (let o = r.length - 1; o >= 0; o--)
      i = { node: r[o], next: i };
  }
  return kh(i, n, e);
}
function kh(n, t, e) {
  for (let i = n; i; i = i.next) {
    let s = ep(i.node);
    if (s)
      return s(Gr.create(t, e, i));
  }
  return 0;
}
function tp(n) {
  return n.pos == n.options.simulateBreak && n.options.simulateDoubleBreak;
}
function ep(n) {
  let t = n.type.prop(Qd);
  if (t)
    return t;
  let e = n.firstChild, i;
  if (e && (i = e.type.prop(N.closedBy))) {
    let s = n.lastChild, r = s && i.indexOf(s.name) > -1;
    return (o) => rp(o, !0, 1, void 0, r && !tp(o) ? s.from : void 0);
  }
  return n.parent == null ? ip : null;
}
function ip() {
  return 0;
}
class Gr extends ts {
  constructor(t, e, i) {
    super(t.state, t.options), this.base = t, this.pos = e, this.context = i;
  }
  /**
  The syntax tree node to which the indentation strategy
  applies.
  */
  get node() {
    return this.context.node;
  }
  /**
  @internal
  */
  static create(t, e, i) {
    return new Gr(t, e, i);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  /**
  Get the indentation for the reference line of the given node
  (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
  */
  baseIndentFor(t) {
    let e = this.state.doc.lineAt(t.from);
    for (; ; ) {
      let i = t.resolve(e.from);
      for (; i.parent && i.parent.from == i.from; )
        i = i.parent;
      if (np(i, t))
        break;
      e = this.state.doc.lineAt(i.from);
    }
    return this.lineIndent(e.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    return kh(this.context.next, this.base, this.pos);
  }
}
function np(n, t) {
  for (let e = t; e; e = e.parent)
    if (n == e)
      return !0;
  return !1;
}
function sp(n) {
  let t = n.node, e = t.childAfter(t.from), i = t.lastChild;
  if (!e)
    return null;
  let s = n.options.simulateBreak, r = n.state.doc.lineAt(e.from), o = s == null || s <= r.from ? r.to : Math.min(r.to, s);
  for (let l = e.to; ; ) {
    let a = t.childAfter(l);
    if (!a || a == i)
      return null;
    if (!a.type.isSkipped) {
      if (a.from >= o)
        return null;
      let c = /^ */.exec(r.text.slice(e.to - r.from))[0].length;
      return { from: e.from, to: e.to + c };
    }
    l = a.to;
  }
}
function rp(n, t, e, i, s) {
  let r = n.textAfter, o = r.match(/^\s*/)[0].length, l = s == n.pos + o, a = sp(n);
  return a ? l ? n.column(a.from) : n.column(a.to) : n.baseIndent + (l ? 0 : n.unit * e);
}
const op = 200;
function lp() {
  return F.transactionFilter.of((n) => {
    if (!n.docChanged || !n.isUserEvent("input.type") && !n.isUserEvent("input.complete"))
      return n;
    let t = n.startState.languageDataAt("indentOnInput", n.startState.selection.main.head);
    if (!t.length)
      return n;
    let e = n.newDoc, { head: i } = n.newSelection.main, s = e.lineAt(i);
    if (i > s.from + op)
      return n;
    let r = e.sliceString(s.from, i);
    if (!t.some((c) => c.test(r)))
      return n;
    let { state: o } = n, l = -1, a = [];
    for (let { head: c } of o.selection.ranges) {
      let h = o.doc.lineAt(c);
      if (h.from == l)
        continue;
      l = h.from;
      let f = Ur(o, h.from);
      if (f == null)
        continue;
      let u = /^\s*/.exec(h.text)[0], d = Ri(o, f);
      u != d && a.push({ from: h.from, to: h.from + u.length, insert: d });
    }
    return a.length ? [n, { changes: a, sequential: !0 }] : n;
  });
}
const ap = /* @__PURE__ */ O.define(), hp = /* @__PURE__ */ new N();
function cp(n, t, e) {
  let i = ut(n);
  if (i.length < e)
    return null;
  let s = i.resolveStack(e, 1), r = null;
  for (let o = s; o; o = o.next) {
    let l = o.node;
    if (l.to <= e || l.from > e)
      continue;
    if (r && l.from < t)
      break;
    let a = l.type.prop(hp);
    if (a && (l.to < i.length - 50 || i.length == n.doc.length || !fp(l))) {
      let c = a(l, n);
      c && c.from <= e && c.from >= t && c.to > e && (r = c);
    }
  }
  return r;
}
function fp(n) {
  let t = n.lastChild;
  return t && t.to == n.to && t.type.isError;
}
function Fn(n, t, e) {
  for (let i of n.facet(ap)) {
    let s = i(n, t, e);
    if (s)
      return s;
  }
  return cp(n, t, e);
}
function Sh(n, t) {
  let e = t.mapPos(n.from, 1), i = t.mapPos(n.to, -1);
  return e >= i ? void 0 : { from: e, to: i };
}
const es = /* @__PURE__ */ R.define({ map: Sh }), zi = /* @__PURE__ */ R.define({ map: Sh });
function Ch(n) {
  let t = [];
  for (let { head: e } of n.state.selection.ranges)
    t.some((i) => i.from <= e && i.to >= e) || t.push(n.lineBlockAt(e));
  return t;
}
const Ie = /* @__PURE__ */ at.define({
  create() {
    return B.none;
  },
  update(n, t) {
    n = n.map(t.changes);
    for (let e of t.effects)
      if (e.is(es) && !up(n, e.value.from, e.value.to)) {
        let { preparePlaceholder: i } = t.state.facet(Dh), s = i ? B.replace({ widget: new xp(i(t.state, e.value)) }) : yl;
        n = n.update({ add: [s.range(e.value.from, e.value.to)] });
      } else e.is(zi) && (n = n.update({
        filter: (i, s) => e.value.from != i || e.value.to != s,
        filterFrom: e.value.from,
        filterTo: e.value.to
      }));
    if (t.selection) {
      let e = !1, { head: i } = t.selection.main;
      n.between(i, i, (s, r) => {
        s < i && r > i && (e = !0);
      }), e && (n = n.update({
        filterFrom: i,
        filterTo: i,
        filter: (s, r) => r <= i || s >= i
      }));
    }
    return n;
  },
  provide: (n) => D.decorations.from(n),
  toJSON(n, t) {
    let e = [];
    return n.between(0, t.doc.length, (i, s) => {
      e.push(i, s);
    }), e;
  },
  fromJSON(n) {
    if (!Array.isArray(n) || n.length % 2)
      throw new RangeError("Invalid JSON for fold state");
    let t = [];
    for (let e = 0; e < n.length; ) {
      let i = n[e++], s = n[e++];
      if (typeof i != "number" || typeof s != "number")
        throw new RangeError("Invalid JSON for fold state");
      t.push(yl.range(i, s));
    }
    return B.set(t, !0);
  }
});
function Hn(n, t, e) {
  var i;
  let s = null;
  return (i = n.field(Ie, !1)) === null || i === void 0 || i.between(t, e, (r, o) => {
    (!s || s.from > r) && (s = { from: r, to: o });
  }), s;
}
function up(n, t, e) {
  let i = !1;
  return n.between(t, t, (s, r) => {
    s == t && r == e && (i = !0);
  }), i;
}
function Ah(n, t) {
  return n.field(Ie, !1) ? t : t.concat(R.appendConfig.of(Oh()));
}
const dp = (n) => {
  for (let t of Ch(n)) {
    let e = Fn(n.state, t.from, t.to);
    if (e)
      return n.dispatch({ effects: Ah(n.state, [es.of(e), Mh(n, e)]) }), !0;
  }
  return !1;
}, pp = (n) => {
  if (!n.state.field(Ie, !1))
    return !1;
  let t = [];
  for (let e of Ch(n)) {
    let i = Hn(n.state, e.from, e.to);
    i && t.push(zi.of(i), Mh(n, i, !1));
  }
  return t.length && n.dispatch({ effects: t }), t.length > 0;
};
function Mh(n, t, e = !0) {
  let i = n.state.doc.lineAt(t.from).number, s = n.state.doc.lineAt(t.to).number;
  return D.announce.of(`${n.state.phrase(e ? "Folded lines" : "Unfolded lines")} ${i} ${n.state.phrase("to")} ${s}.`);
}
const mp = (n) => {
  let { state: t } = n, e = [];
  for (let i = 0; i < t.doc.length; ) {
    let s = n.lineBlockAt(i), r = Fn(t, s.from, s.to);
    r && e.push(es.of(r)), i = (r ? n.lineBlockAt(r.to) : s).to + 1;
  }
  return e.length && n.dispatch({ effects: Ah(n.state, e) }), !!e.length;
}, gp = (n) => {
  let t = n.state.field(Ie, !1);
  if (!t || !t.size)
    return !1;
  let e = [];
  return t.between(0, n.state.doc.length, (i, s) => {
    e.push(zi.of({ from: i, to: s }));
  }), n.dispatch({ effects: e }), !0;
}, yp = [
  { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: dp },
  { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: pp },
  { key: "Ctrl-Alt-[", run: mp },
  { key: "Ctrl-Alt-]", run: gp }
], bp = {
  placeholderDOM: null,
  preparePlaceholder: null,
  placeholderText: "…"
}, Dh = /* @__PURE__ */ O.define({
  combine(n) {
    return Zt(n, bp);
  }
});
function Oh(n) {
  return [Ie, kp];
}
function Th(n, t) {
  let { state: e } = n, i = e.facet(Dh), s = (o) => {
    let l = n.lineBlockAt(n.posAtDOM(o.target)), a = Hn(n.state, l.from, l.to);
    a && n.dispatch({ effects: zi.of(a) }), o.preventDefault();
  };
  if (i.placeholderDOM)
    return i.placeholderDOM(n, s, t);
  let r = document.createElement("span");
  return r.textContent = i.placeholderText, r.setAttribute("aria-label", e.phrase("folded code")), r.title = e.phrase("unfold"), r.className = "cm-foldPlaceholder", r.onclick = s, r;
}
const yl = /* @__PURE__ */ B.replace({ widget: /* @__PURE__ */ new class extends ke {
  toDOM(n) {
    return Th(n, null);
  }
}() });
class xp extends ke {
  constructor(t) {
    super(), this.value = t;
  }
  eq(t) {
    return this.value == t.value;
  }
  toDOM(t) {
    return Th(t, this.value);
  }
}
const wp = {
  openText: "⌄",
  closedText: "›",
  markerDOM: null,
  domEventHandlers: {},
  foldingChanged: () => !1
};
class Ss extends se {
  constructor(t, e) {
    super(), this.config = t, this.open = e;
  }
  eq(t) {
    return this.config == t.config && this.open == t.open;
  }
  toDOM(t) {
    if (this.config.markerDOM)
      return this.config.markerDOM(this.open);
    let e = document.createElement("span");
    return e.textContent = this.open ? this.config.openText : this.config.closedText, e.title = t.state.phrase(this.open ? "Fold line" : "Unfold line"), e;
  }
}
function vp(n = {}) {
  let t = Object.assign(Object.assign({}, wp), n), e = new Ss(t, !0), i = new Ss(t, !1), s = Q.fromClass(class {
    constructor(o) {
      this.from = o.viewport.from, this.markers = this.buildMarkers(o);
    }
    update(o) {
      (o.docChanged || o.viewportChanged || o.startState.facet(ve) != o.state.facet(ve) || o.startState.field(Ie, !1) != o.state.field(Ie, !1) || ut(o.startState) != ut(o.state) || t.foldingChanged(o)) && (this.markers = this.buildMarkers(o.view));
    }
    buildMarkers(o) {
      let l = new ge();
      for (let a of o.viewportLineBlocks) {
        let c = Hn(o.state, a.from, a.to) ? i : Fn(o.state, a.from, a.to) ? e : null;
        c && l.add(a.from, a.from, c);
      }
      return l.finish();
    }
  }), { domEventHandlers: r } = t;
  return [
    s,
    xd({
      class: "cm-foldGutter",
      markers(o) {
        var l;
        return ((l = o.plugin(s)) === null || l === void 0 ? void 0 : l.markers) || H.empty;
      },
      initialSpacer() {
        return new Ss(t, !1);
      },
      domEventHandlers: Object.assign(Object.assign({}, r), { click: (o, l, a) => {
        if (r.click && r.click(o, l, a))
          return !0;
        let c = Hn(o.state, l.from, l.to);
        if (c)
          return o.dispatch({ effects: zi.of(c) }), !0;
        let h = Fn(o.state, l.from, l.to);
        return h ? (o.dispatch({ effects: es.of(h) }), !0) : !1;
      } })
    }),
    Oh()
  ];
}
const kp = /* @__PURE__ */ D.baseTheme({
  ".cm-foldPlaceholder": {
    backgroundColor: "#eee",
    border: "1px solid #ddd",
    color: "#888",
    borderRadius: ".2em",
    margin: "0 1px",
    padding: "0 1px",
    cursor: "pointer"
  },
  ".cm-foldGutter span": {
    padding: "0 1px",
    cursor: "pointer"
  }
});
class qi {
  constructor(t, e) {
    this.specs = t;
    let i;
    function s(l) {
      let a = ye.newName();
      return (i || (i = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const r = typeof e.all == "string" ? e.all : e.all ? s(e.all) : void 0, o = e.scope;
    this.scope = o instanceof Yt ? (l) => l.prop(gi) == o.data : o ? (l) => l == o : void 0, this.style = wh(t.map((l) => ({
      tag: l.tag,
      class: l.class || s(Object.assign({}, l, { tag: null }))
    })), {
      all: r
    }).style, this.module = i ? new ye(i) : null, this.themeType = e.themeType;
  }
  /**
  Create a highlighter style that associates the given styles to
  the given tags. The specs must be objects that hold a style tag
  or array of tags in their `tag` property, and either a single
  `class` property providing a static CSS class (for highlighter
  that rely on external styling), or a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
  set of CSS properties (which define the styling for those tags).
  
  The CSS rules created for a highlighter will be emitted in the
  order of the spec's properties. That means that for elements that
  have multiple tags associated with them, styles defined further
  down in the list will have a higher CSS precedence than styles
  defined earlier.
  */
  static define(t, e) {
    return new qi(t, e || {});
  }
}
const yr = /* @__PURE__ */ O.define(), Bh = /* @__PURE__ */ O.define({
  combine(n) {
    return n.length ? [n[0]] : null;
  }
});
function Cs(n) {
  let t = n.facet(yr);
  return t.length ? t : n.facet(Bh);
}
function Lh(n, t) {
  let e = [Cp], i;
  return n instanceof qi && (n.module && e.push(D.styleModule.of(n.module)), i = n.themeType), t != null && t.fallback ? e.push(Bh.of(n)) : i ? e.push(yr.computeN([D.darkTheme], (s) => s.facet(D.darkTheme) == (i == "dark") ? [n] : [])) : e.push(yr.of(n)), e;
}
class Sp {
  constructor(t) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = ut(t.state), this.decorations = this.buildDeco(t, Cs(t.state)), this.decoratedTo = t.viewport.to;
  }
  update(t) {
    let e = ut(t.state), i = Cs(t.state), s = i != Cs(t.startState), { viewport: r } = t.view, o = t.changes.mapPos(this.decoratedTo, 1);
    e.length < r.to && !s && e.type == this.tree.type && o >= r.to ? (this.decorations = this.decorations.map(t.changes), this.decoratedTo = o) : (e != this.tree || t.viewportChanged || s) && (this.tree = e, this.decorations = this.buildDeco(t.view, i), this.decoratedTo = r.to);
  }
  buildDeco(t, e) {
    if (!e || !this.tree.length)
      return B.none;
    let i = new ge();
    for (let { from: s, to: r } of t.visibleRanges)
      jd(this.tree, e, (o, l, a) => {
        i.add(o, l, this.markCache[a] || (this.markCache[a] = B.mark({ class: a })));
      }, s, r);
    return i.finish();
  }
}
const Cp = /* @__PURE__ */ Ne.high(/* @__PURE__ */ Q.fromClass(Sp, {
  decorations: (n) => n.decorations
})), Ap = /* @__PURE__ */ qi.define([
  {
    tag: m.meta,
    color: "#404740"
  },
  {
    tag: m.link,
    textDecoration: "underline"
  },
  {
    tag: m.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: m.emphasis,
    fontStyle: "italic"
  },
  {
    tag: m.strong,
    fontWeight: "bold"
  },
  {
    tag: m.strikethrough,
    textDecoration: "line-through"
  },
  {
    tag: m.keyword,
    color: "#708"
  },
  {
    tag: [m.atom, m.bool, m.url, m.contentSeparator, m.labelName],
    color: "#219"
  },
  {
    tag: [m.literal, m.inserted],
    color: "#164"
  },
  {
    tag: [m.string, m.deleted],
    color: "#a11"
  },
  {
    tag: [m.regexp, m.escape, /* @__PURE__ */ m.special(m.string)],
    color: "#e40"
  },
  {
    tag: /* @__PURE__ */ m.definition(m.variableName),
    color: "#00f"
  },
  {
    tag: /* @__PURE__ */ m.local(m.variableName),
    color: "#30a"
  },
  {
    tag: [m.typeName, m.namespace],
    color: "#085"
  },
  {
    tag: m.className,
    color: "#167"
  },
  {
    tag: [/* @__PURE__ */ m.special(m.variableName), m.macroName],
    color: "#256"
  },
  {
    tag: /* @__PURE__ */ m.definition(m.propertyName),
    color: "#00c"
  },
  {
    tag: m.comment,
    color: "#940"
  },
  {
    tag: m.invalid,
    color: "#f00"
  }
]), Mp = /* @__PURE__ */ D.baseTheme({
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
}), Rh = 1e4, Ph = "()[]{}", Eh = /* @__PURE__ */ O.define({
  combine(n) {
    return Zt(n, {
      afterCursor: !0,
      brackets: Ph,
      maxScanDistance: Rh,
      renderMatch: Tp
    });
  }
}), Dp = /* @__PURE__ */ B.mark({ class: "cm-matchingBracket" }), Op = /* @__PURE__ */ B.mark({ class: "cm-nonmatchingBracket" });
function Tp(n) {
  let t = [], e = n.matched ? Dp : Op;
  return t.push(e.range(n.start.from, n.start.to)), n.end && t.push(e.range(n.end.from, n.end.to)), t;
}
const Bp = /* @__PURE__ */ at.define({
  create() {
    return B.none;
  },
  update(n, t) {
    if (!t.docChanged && !t.selection)
      return n;
    let e = [], i = t.state.facet(Eh);
    for (let s of t.state.selection.ranges) {
      if (!s.empty)
        continue;
      let r = _t(t.state, s.head, -1, i) || s.head > 0 && _t(t.state, s.head - 1, 1, i) || i.afterCursor && (_t(t.state, s.head, 1, i) || s.head < t.state.doc.length && _t(t.state, s.head + 1, -1, i));
      r && (e = e.concat(i.renderMatch(r, t.state)));
    }
    return B.set(e, !0);
  },
  provide: (n) => D.decorations.from(n)
}), Lp = [
  Bp,
  Mp
];
function Rp(n = {}) {
  return [Eh.of(n), Lp];
}
const Pp = /* @__PURE__ */ new N();
function br(n, t, e) {
  let i = n.prop(t < 0 ? N.openedBy : N.closedBy);
  if (i)
    return i;
  if (n.name.length == 1) {
    let s = e.indexOf(n.name);
    if (s > -1 && s % 2 == (t < 0 ? 1 : 0))
      return [e[s + t]];
  }
  return null;
}
function xr(n) {
  let t = n.type.prop(Pp);
  return t ? t(n.node) : n;
}
function _t(n, t, e, i = {}) {
  let s = i.maxScanDistance || Rh, r = i.brackets || Ph, o = ut(n), l = o.resolveInner(t, e);
  for (let a = l; a; a = a.parent) {
    let c = br(a.type, e, r);
    if (c && a.from < a.to) {
      let h = xr(a);
      if (h && (e > 0 ? t >= h.from && t < h.to : t > h.from && t <= h.to))
        return Ep(n, t, e, a, h, c, r);
    }
  }
  return Ip(n, t, e, o, l.type, s, r);
}
function Ep(n, t, e, i, s, r, o) {
  let l = i.parent, a = { from: s.from, to: s.to }, c = 0, h = l == null ? void 0 : l.cursor();
  if (h && (e < 0 ? h.childBefore(i.from) : h.childAfter(i.to)))
    do
      if (e < 0 ? h.to <= i.from : h.from >= i.to) {
        if (c == 0 && r.indexOf(h.type.name) > -1 && h.from < h.to) {
          let f = xr(h);
          return { start: a, end: f ? { from: f.from, to: f.to } : void 0, matched: !0 };
        } else if (br(h.type, e, o))
          c++;
        else if (br(h.type, -e, o)) {
          if (c == 0) {
            let f = xr(h);
            return {
              start: a,
              end: f && f.from < f.to ? { from: f.from, to: f.to } : void 0,
              matched: !1
            };
          }
          c--;
        }
      }
    while (e < 0 ? h.prevSibling() : h.nextSibling());
  return { start: a, matched: !1 };
}
function Ip(n, t, e, i, s, r, o) {
  let l = e < 0 ? n.sliceDoc(t - 1, t) : n.sliceDoc(t, t + 1), a = o.indexOf(l);
  if (a < 0 || a % 2 == 0 != e > 0)
    return null;
  let c = { from: e < 0 ? t - 1 : t, to: e > 0 ? t + 1 : t }, h = n.doc.iterRange(t, e > 0 ? n.doc.length : 0), f = 0;
  for (let u = 0; !h.next().done && u <= r; ) {
    let d = h.value;
    e < 0 && (u += d.length);
    let p = t + u * e;
    for (let g = e > 0 ? 0 : d.length - 1, y = e > 0 ? d.length : -1; g != y; g += e) {
      let b = o.indexOf(d[g]);
      if (!(b < 0 || i.resolveInner(p + g, 1).type != s))
        if (b % 2 == 0 == e > 0)
          f++;
        else {
          if (f == 1)
            return { start: c, end: { from: p + g, to: p + g + 1 }, matched: b >> 1 == a >> 1 };
          f--;
        }
    }
    e > 0 && (u += d.length);
  }
  return h.done ? { start: c, matched: !1 } : null;
}
const Np = /* @__PURE__ */ Object.create(null), bl = [It.none], xl = [], wl = /* @__PURE__ */ Object.create(null), Fp = /* @__PURE__ */ Object.create(null);
for (let [n, t] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  Fp[n] = /* @__PURE__ */ Hp(Np, t);
function As(n, t) {
  xl.indexOf(n) > -1 || (xl.push(n), console.warn(t));
}
function Hp(n, t) {
  let e = [];
  for (let l of t.split(" ")) {
    let a = [];
    for (let c of l.split(".")) {
      let h = n[c] || m[c];
      h ? typeof h == "function" ? a.length ? a = a.map(h) : As(c, `Modifier ${c} used at start of tag`) : a.length ? As(c, `Tag ${c} used as modifier`) : a = Array.isArray(h) ? h : [h] : As(c, `Unknown highlighting tag ${c}`);
    }
    for (let c of a)
      e.push(c);
  }
  if (!e.length)
    return 0;
  let i = t.replace(/ /g, "_"), s = i + " " + e.map((l) => l.id), r = wl[s];
  if (r)
    return r.id;
  let o = wl[s] = It.define({
    id: bl.length,
    name: i,
    props: [$d({ [i]: e })]
  });
  return bl.push(o), o.id;
}
Y.RTL, Y.LTR;
const Vp = (n) => {
  let { state: t } = n, e = t.doc.lineAt(t.selection.main.from), i = _r(n.state, e.from);
  return i.line ? Wp(n) : i.block ? qp(n) : !1;
};
function Yr(n, t) {
  return ({ state: e, dispatch: i }) => {
    if (e.readOnly)
      return !1;
    let s = n(t, e);
    return s ? (i(e.update(s)), !0) : !1;
  };
}
const Wp = /* @__PURE__ */ Yr(
  jp,
  0
  /* CommentOption.Toggle */
), zp = /* @__PURE__ */ Yr(
  Ih,
  0
  /* CommentOption.Toggle */
), qp = /* @__PURE__ */ Yr(
  (n, t) => Ih(n, t, Kp(t)),
  0
  /* CommentOption.Toggle */
);
function _r(n, t) {
  let e = n.languageDataAt("commentTokens", t);
  return e.length ? e[0] : {};
}
const ci = 50;
function $p(n, { open: t, close: e }, i, s) {
  let r = n.sliceDoc(i - ci, i), o = n.sliceDoc(s, s + ci), l = /\s*$/.exec(r)[0].length, a = /^\s*/.exec(o)[0].length, c = r.length - l;
  if (r.slice(c - t.length, c) == t && o.slice(a, a + e.length) == e)
    return {
      open: { pos: i - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let h, f;
  s - i <= 2 * ci ? h = f = n.sliceDoc(i, s) : (h = n.sliceDoc(i, i + ci), f = n.sliceDoc(s - ci, s));
  let u = /^\s*/.exec(h)[0].length, d = /\s*$/.exec(f)[0].length, p = f.length - d - e.length;
  return h.slice(u, u + t.length) == t && f.slice(p, p + e.length) == e ? {
    open: {
      pos: i + u + t.length,
      margin: /\s/.test(h.charAt(u + t.length)) ? 1 : 0
    },
    close: {
      pos: s - d - e.length,
      margin: /\s/.test(f.charAt(p - 1)) ? 1 : 0
    }
  } : null;
}
function Kp(n) {
  let t = [];
  for (let e of n.selection.ranges) {
    let i = n.doc.lineAt(e.from), s = e.to <= i.to ? i : n.doc.lineAt(e.to);
    s.from > i.from && s.from == e.to && (s = e.to == i.to + 1 ? i : n.doc.lineAt(e.to - 1));
    let r = t.length - 1;
    r >= 0 && t[r].to > i.from ? t[r].to = s.to : t.push({ from: i.from + /^\s*/.exec(i.text)[0].length, to: s.to });
  }
  return t;
}
function Ih(n, t, e = t.selection.ranges) {
  let i = e.map((r) => _r(t, r.from).block);
  if (!i.every((r) => r))
    return null;
  let s = e.map((r, o) => $p(t, i[o], r.from, r.to));
  if (n != 2 && !s.every((r) => r))
    return { changes: t.changes(e.map((r, o) => s[o] ? [] : [{ from: r.from, insert: i[o].open + " " }, { from: r.to, insert: " " + i[o].close }])) };
  if (n != 1 && s.some((r) => r)) {
    let r = [];
    for (let o = 0, l; o < s.length; o++)
      if (l = s[o]) {
        let a = i[o], { open: c, close: h } = l;
        r.push({ from: c.pos - a.open.length, to: c.pos + c.margin }, { from: h.pos - h.margin, to: h.pos + a.close.length });
      }
    return { changes: r };
  }
  return null;
}
function jp(n, t, e = t.selection.ranges) {
  let i = [], s = -1;
  for (let { from: r, to: o } of e) {
    let l = i.length, a = 1e9, c = _r(t, r).line;
    if (c) {
      for (let h = r; h <= o; ) {
        let f = t.doc.lineAt(h);
        if (f.from > s && (r == o || o > f.from)) {
          s = f.from;
          let u = /^\s*/.exec(f.text)[0].length, d = u == f.length, p = f.text.slice(u, u + c.length) == c ? u : -1;
          u < f.text.length && u < a && (a = u), i.push({ line: f, comment: p, token: c, indent: u, empty: d, single: !1 });
        }
        h = f.to + 1;
      }
      if (a < 1e9)
        for (let h = l; h < i.length; h++)
          i[h].indent < i[h].line.text.length && (i[h].indent = a);
      i.length == l + 1 && (i[l].single = !0);
    }
  }
  if (n != 2 && i.some((r) => r.comment < 0 && (!r.empty || r.single))) {
    let r = [];
    for (let { line: l, token: a, indent: c, empty: h, single: f } of i)
      (f || !h) && r.push({ from: l.from + c, insert: a + " " });
    let o = t.changes(r);
    return { changes: o, selection: t.selection.map(o, 1) };
  } else if (n != 1 && i.some((r) => r.comment >= 0)) {
    let r = [];
    for (let { line: o, comment: l, token: a } of i)
      if (l >= 0) {
        let c = o.from + l, h = c + a.length;
        o.text[h - o.from] == " " && h++, r.push({ from: c, to: h });
      }
    return { changes: r };
  }
  return null;
}
const wr = /* @__PURE__ */ re.define(), Up = /* @__PURE__ */ re.define(), Gp = /* @__PURE__ */ O.define(), Nh = /* @__PURE__ */ O.define({
  combine(n) {
    return Zt(n, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (t, e) => e
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (t, e) => (i, s) => t(i, s) || e(i, s)
    });
  }
}), Fh = /* @__PURE__ */ at.define({
  create() {
    return Jt.empty;
  },
  update(n, t) {
    let e = t.state.facet(Nh), i = t.annotation(wr);
    if (i) {
      let a = vt.fromTransaction(t, i.selection), c = i.side, h = c == 0 ? n.undone : n.done;
      return a ? h = Vn(h, h.length, e.minDepth, a) : h = Wh(h, t.startState.selection), new Jt(c == 0 ? i.rest : h, c == 0 ? h : i.rest);
    }
    let s = t.annotation(Up);
    if ((s == "full" || s == "before") && (n = n.isolate()), t.annotation(tt.addToHistory) === !1)
      return t.changes.empty ? n : n.addMapping(t.changes.desc);
    let r = vt.fromTransaction(t), o = t.annotation(tt.time), l = t.annotation(tt.userEvent);
    return r ? n = n.addChanges(r, o, l, e, t) : t.selection && (n = n.addSelection(t.startState.selection, o, l, e.newGroupDelay)), (s == "full" || s == "after") && (n = n.isolate()), n;
  },
  toJSON(n) {
    return { done: n.done.map((t) => t.toJSON()), undone: n.undone.map((t) => t.toJSON()) };
  },
  fromJSON(n) {
    return new Jt(n.done.map(vt.fromJSON), n.undone.map(vt.fromJSON));
  }
});
function Yp(n = {}) {
  return [
    Fh,
    Nh.of(n),
    D.domEventHandlers({
      beforeinput(t, e) {
        let i = t.inputType == "historyUndo" ? Hh : t.inputType == "historyRedo" ? vr : null;
        return i ? (t.preventDefault(), i(e)) : !1;
      }
    })
  ];
}
function is(n, t) {
  return function({ state: e, dispatch: i }) {
    if (!t && e.readOnly)
      return !1;
    let s = e.field(Fh, !1);
    if (!s)
      return !1;
    let r = s.pop(n, e, t);
    return r ? (i(r), !0) : !1;
  };
}
const Hh = /* @__PURE__ */ is(0, !1), vr = /* @__PURE__ */ is(1, !1), _p = /* @__PURE__ */ is(0, !0), Jp = /* @__PURE__ */ is(1, !0);
class vt {
  constructor(t, e, i, s, r) {
    this.changes = t, this.effects = e, this.mapped = i, this.startSelection = s, this.selectionsAfter = r;
  }
  setSelAfter(t) {
    return new vt(this.changes, this.effects, this.mapped, this.startSelection, t);
  }
  toJSON() {
    var t, e, i;
    return {
      changes: (t = this.changes) === null || t === void 0 ? void 0 : t.toJSON(),
      mapped: (e = this.mapped) === null || e === void 0 ? void 0 : e.toJSON(),
      startSelection: (i = this.startSelection) === null || i === void 0 ? void 0 : i.toJSON(),
      selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
    };
  }
  static fromJSON(t) {
    return new vt(t.changes && Z.fromJSON(t.changes), [], t.mapped && Xt.fromJSON(t.mapped), t.startSelection && x.fromJSON(t.startSelection), t.selectionsAfter.map(x.fromJSON));
  }
  // This does not check `addToHistory` and such, it assumes the
  // transaction needs to be converted to an item. Returns null when
  // there are no changes or effects in the transaction.
  static fromTransaction(t, e) {
    let i = Lt;
    for (let s of t.startState.facet(Gp)) {
      let r = s(t);
      r.length && (i = i.concat(r));
    }
    return !i.length && t.changes.empty ? null : new vt(t.changes.invert(t.startState.doc), i, void 0, e || t.startState.selection, Lt);
  }
  static selection(t) {
    return new vt(void 0, Lt, void 0, void 0, t);
  }
}
function Vn(n, t, e, i) {
  let s = t + 1 > e + 20 ? t - e - 1 : 0, r = n.slice(s, t);
  return r.push(i), r;
}
function Xp(n, t) {
  let e = [], i = !1;
  return n.iterChangedRanges((s, r) => e.push(s, r)), t.iterChangedRanges((s, r, o, l) => {
    for (let a = 0; a < e.length; ) {
      let c = e[a++], h = e[a++];
      l >= c && o <= h && (i = !0);
    }
  }), i;
}
function Qp(n, t) {
  return n.ranges.length == t.ranges.length && n.ranges.filter((e, i) => e.empty != t.ranges[i].empty).length === 0;
}
function Vh(n, t) {
  return n.length ? t.length ? n.concat(t) : n : t;
}
const Lt = [], Zp = 200;
function Wh(n, t) {
  if (n.length) {
    let e = n[n.length - 1], i = e.selectionsAfter.slice(Math.max(0, e.selectionsAfter.length - Zp));
    return i.length && i[i.length - 1].eq(t) ? n : (i.push(t), Vn(n, n.length - 1, 1e9, e.setSelAfter(i)));
  } else
    return [vt.selection([t])];
}
function tm(n) {
  let t = n[n.length - 1], e = n.slice();
  return e[n.length - 1] = t.setSelAfter(t.selectionsAfter.slice(0, t.selectionsAfter.length - 1)), e;
}
function Ms(n, t) {
  if (!n.length)
    return n;
  let e = n.length, i = Lt;
  for (; e; ) {
    let s = em(n[e - 1], t, i);
    if (s.changes && !s.changes.empty || s.effects.length) {
      let r = n.slice(0, e);
      return r[e - 1] = s, r;
    } else
      t = s.mapped, e--, i = s.selectionsAfter;
  }
  return i.length ? [vt.selection(i)] : Lt;
}
function em(n, t, e) {
  let i = Vh(n.selectionsAfter.length ? n.selectionsAfter.map((l) => l.map(t)) : Lt, e);
  if (!n.changes)
    return vt.selection(i);
  let s = n.changes.map(t), r = t.mapDesc(n.changes, !0), o = n.mapped ? n.mapped.composeDesc(r) : r;
  return new vt(s, R.mapEffects(n.effects, t), o, n.startSelection.map(r), i);
}
const im = /^(input\.type|delete)($|\.)/;
class Jt {
  constructor(t, e, i = 0, s = void 0) {
    this.done = t, this.undone = e, this.prevTime = i, this.prevUserEvent = s;
  }
  isolate() {
    return this.prevTime ? new Jt(this.done, this.undone) : this;
  }
  addChanges(t, e, i, s, r) {
    let o = this.done, l = o[o.length - 1];
    return l && l.changes && !l.changes.empty && t.changes && (!i || im.test(i)) && (!l.selectionsAfter.length && e - this.prevTime < s.newGroupDelay && s.joinToEvent(r, Xp(l.changes, t.changes)) || // For compose (but not compose.start) events, always join with previous event
    i == "input.type.compose") ? o = Vn(o, o.length - 1, s.minDepth, new vt(t.changes.compose(l.changes), Vh(R.mapEffects(t.effects, l.changes), l.effects), l.mapped, l.startSelection, Lt)) : o = Vn(o, o.length, s.minDepth, t), new Jt(o, Lt, e, i);
  }
  addSelection(t, e, i, s) {
    let r = this.done.length ? this.done[this.done.length - 1].selectionsAfter : Lt;
    return r.length > 0 && e - this.prevTime < s && i == this.prevUserEvent && i && /^select($|\.)/.test(i) && Qp(r[r.length - 1], t) ? this : new Jt(Wh(this.done, t), this.undone, e, i);
  }
  addMapping(t) {
    return new Jt(Ms(this.done, t), Ms(this.undone, t), this.prevTime, this.prevUserEvent);
  }
  pop(t, e, i) {
    let s = t == 0 ? this.done : this.undone;
    if (s.length == 0)
      return null;
    let r = s[s.length - 1], o = r.selectionsAfter[0] || e.selection;
    if (i && r.selectionsAfter.length)
      return e.update({
        selection: r.selectionsAfter[r.selectionsAfter.length - 1],
        annotations: wr.of({ side: t, rest: tm(s), selection: o }),
        userEvent: t == 0 ? "select.undo" : "select.redo",
        scrollIntoView: !0
      });
    if (r.changes) {
      let l = s.length == 1 ? Lt : s.slice(0, s.length - 1);
      return r.mapped && (l = Ms(l, r.mapped)), e.update({
        changes: r.changes,
        selection: r.startSelection,
        effects: r.effects,
        annotations: wr.of({ side: t, rest: l, selection: o }),
        filter: !1,
        userEvent: t == 0 ? "undo" : "redo",
        scrollIntoView: !0
      });
    } else
      return null;
  }
}
Jt.empty = /* @__PURE__ */ new Jt(Lt, Lt);
const nm = [
  { key: "Mod-z", run: Hh, preventDefault: !0 },
  { key: "Mod-y", mac: "Mod-Shift-z", run: vr, preventDefault: !0 },
  { linux: "Ctrl-Shift-z", run: vr, preventDefault: !0 },
  { key: "Mod-u", run: _p, preventDefault: !0 },
  { key: "Alt-u", mac: "Mod-Shift-u", run: Jp, preventDefault: !0 }
];
function ni(n, t) {
  return x.create(n.ranges.map(t), n.mainIndex);
}
function te(n, t) {
  return n.update({ selection: t, scrollIntoView: !0, userEvent: "select" });
}
function Vt({ state: n, dispatch: t }, e) {
  let i = ni(n.selection, e);
  return i.eq(n.selection, !0) ? !1 : (t(te(n, i)), !0);
}
function ns(n, t) {
  return x.cursor(t ? n.to : n.from);
}
function zh(n, t) {
  return Vt(n, (e) => e.empty ? n.moveByChar(e, t) : ns(e, t));
}
function dt(n) {
  return n.textDirectionAt(n.state.selection.main.head) == Y.LTR;
}
const qh = (n) => zh(n, !dt(n)), $h = (n) => zh(n, dt(n));
function Kh(n, t) {
  return Vt(n, (e) => e.empty ? n.moveByGroup(e, t) : ns(e, t));
}
const sm = (n) => Kh(n, !dt(n)), rm = (n) => Kh(n, dt(n));
function om(n, t, e) {
  if (t.type.prop(e))
    return !0;
  let i = t.to - t.from;
  return i && (i > 2 || /[^\s,.;:]/.test(n.sliceDoc(t.from, t.to))) || t.firstChild;
}
function ss(n, t, e) {
  let i = ut(n).resolveInner(t.head), s = e ? N.closedBy : N.openedBy;
  for (let a = t.head; ; ) {
    let c = e ? i.childAfter(a) : i.childBefore(a);
    if (!c)
      break;
    om(n, c, s) ? i = c : a = e ? c.to : c.from;
  }
  let r = i.type.prop(s), o, l;
  return r && (o = e ? _t(n, i.from, 1) : _t(n, i.to, -1)) && o.matched ? l = e ? o.end.to : o.end.from : l = e ? i.to : i.from, x.cursor(l, e ? -1 : 1);
}
const lm = (n) => Vt(n, (t) => ss(n.state, t, !dt(n))), am = (n) => Vt(n, (t) => ss(n.state, t, dt(n)));
function jh(n, t) {
  return Vt(n, (e) => {
    if (!e.empty)
      return ns(e, t);
    let i = n.moveVertically(e, t);
    return i.head != e.head ? i : n.moveToLineBoundary(e, t);
  });
}
const Uh = (n) => jh(n, !1), Gh = (n) => jh(n, !0);
function Yh(n) {
  let t = n.scrollDOM.clientHeight < n.scrollDOM.scrollHeight - 2, e = 0, i = 0, s;
  if (t) {
    for (let r of n.state.facet(D.scrollMargins)) {
      let o = r(n);
      o != null && o.top && (e = Math.max(o == null ? void 0 : o.top, e)), o != null && o.bottom && (i = Math.max(o == null ? void 0 : o.bottom, i));
    }
    s = n.scrollDOM.clientHeight - e - i;
  } else
    s = (n.dom.ownerDocument.defaultView || window).innerHeight;
  return {
    marginTop: e,
    marginBottom: i,
    selfScroll: t,
    height: Math.max(n.defaultLineHeight, s - 5)
  };
}
function _h(n, t) {
  let e = Yh(n), { state: i } = n, s = ni(i.selection, (o) => o.empty ? n.moveVertically(o, t, e.height) : ns(o, t));
  if (s.eq(i.selection))
    return !1;
  let r;
  if (e.selfScroll) {
    let o = n.coordsAtPos(i.selection.main.head), l = n.scrollDOM.getBoundingClientRect(), a = l.top + e.marginTop, c = l.bottom - e.marginBottom;
    o && o.top > a && o.bottom < c && (r = D.scrollIntoView(s.main.head, { y: "start", yMargin: o.top - a }));
  }
  return n.dispatch(te(i, s), { effects: r }), !0;
}
const vl = (n) => _h(n, !1), kr = (n) => _h(n, !0);
function Se(n, t, e) {
  let i = n.lineBlockAt(t.head), s = n.moveToLineBoundary(t, e);
  if (s.head == t.head && s.head != (e ? i.to : i.from) && (s = n.moveToLineBoundary(t, e, !1)), !e && s.head == i.from && i.length) {
    let r = /^\s*/.exec(n.state.sliceDoc(i.from, Math.min(i.from + 100, i.to)))[0].length;
    r && t.head != i.from + r && (s = x.cursor(i.from + r));
  }
  return s;
}
const hm = (n) => Vt(n, (t) => Se(n, t, !0)), cm = (n) => Vt(n, (t) => Se(n, t, !1)), fm = (n) => Vt(n, (t) => Se(n, t, !dt(n))), um = (n) => Vt(n, (t) => Se(n, t, dt(n))), dm = (n) => Vt(n, (t) => x.cursor(n.lineBlockAt(t.head).from, 1)), pm = (n) => Vt(n, (t) => x.cursor(n.lineBlockAt(t.head).to, -1));
function mm(n, t, e) {
  let i = !1, s = ni(n.selection, (r) => {
    let o = _t(n, r.head, -1) || _t(n, r.head, 1) || r.head > 0 && _t(n, r.head - 1, 1) || r.head < n.doc.length && _t(n, r.head + 1, -1);
    if (!o || !o.end)
      return r;
    i = !0;
    let l = o.start.from == r.head ? o.end.to : o.end.from;
    return x.cursor(l);
  });
  return i ? (t(te(n, s)), !0) : !1;
}
const gm = ({ state: n, dispatch: t }) => mm(n, t);
function Nt(n, t) {
  let e = ni(n.state.selection, (i) => {
    let s = t(i);
    return x.range(i.anchor, s.head, s.goalColumn, s.bidiLevel || void 0);
  });
  return e.eq(n.state.selection) ? !1 : (n.dispatch(te(n.state, e)), !0);
}
function Jh(n, t) {
  return Nt(n, (e) => n.moveByChar(e, t));
}
const Xh = (n) => Jh(n, !dt(n)), Qh = (n) => Jh(n, dt(n));
function Zh(n, t) {
  return Nt(n, (e) => n.moveByGroup(e, t));
}
const ym = (n) => Zh(n, !dt(n)), bm = (n) => Zh(n, dt(n)), xm = (n) => Nt(n, (t) => ss(n.state, t, !dt(n))), wm = (n) => Nt(n, (t) => ss(n.state, t, dt(n)));
function tc(n, t) {
  return Nt(n, (e) => n.moveVertically(e, t));
}
const ec = (n) => tc(n, !1), ic = (n) => tc(n, !0);
function nc(n, t) {
  return Nt(n, (e) => n.moveVertically(e, t, Yh(n).height));
}
const kl = (n) => nc(n, !1), Sl = (n) => nc(n, !0), vm = (n) => Nt(n, (t) => Se(n, t, !0)), km = (n) => Nt(n, (t) => Se(n, t, !1)), Sm = (n) => Nt(n, (t) => Se(n, t, !dt(n))), Cm = (n) => Nt(n, (t) => Se(n, t, dt(n))), Am = (n) => Nt(n, (t) => x.cursor(n.lineBlockAt(t.head).from)), Mm = (n) => Nt(n, (t) => x.cursor(n.lineBlockAt(t.head).to)), Cl = ({ state: n, dispatch: t }) => (t(te(n, { anchor: 0 })), !0), Al = ({ state: n, dispatch: t }) => (t(te(n, { anchor: n.doc.length })), !0), Ml = ({ state: n, dispatch: t }) => (t(te(n, { anchor: n.selection.main.anchor, head: 0 })), !0), Dl = ({ state: n, dispatch: t }) => (t(te(n, { anchor: n.selection.main.anchor, head: n.doc.length })), !0), Dm = ({ state: n, dispatch: t }) => (t(n.update({ selection: { anchor: 0, head: n.doc.length }, userEvent: "select" })), !0), Om = ({ state: n, dispatch: t }) => {
  let e = rs(n).map(({ from: i, to: s }) => x.range(i, Math.min(s + 1, n.doc.length)));
  return t(n.update({ selection: x.create(e), userEvent: "select" })), !0;
}, Tm = ({ state: n, dispatch: t }) => {
  let e = ni(n.selection, (i) => {
    let s = ut(n), r = s.resolveStack(i.from, 1);
    if (i.empty) {
      let o = s.resolveStack(i.from, -1);
      o.node.from >= r.node.from && o.node.to <= r.node.to && (r = o);
    }
    for (let o = r; o; o = o.next) {
      let { node: l } = o;
      if ((l.from < i.from && l.to >= i.to || l.to > i.to && l.from <= i.from) && o.next)
        return x.range(l.to, l.from);
    }
    return i;
  });
  return e.eq(n.selection) ? !1 : (t(te(n, e)), !0);
}, Bm = ({ state: n, dispatch: t }) => {
  let e = n.selection, i = null;
  return e.ranges.length > 1 ? i = x.create([e.main]) : e.main.empty || (i = x.create([x.cursor(e.main.head)])), i ? (t(te(n, i)), !0) : !1;
};
function $i(n, t) {
  if (n.state.readOnly)
    return !1;
  let e = "delete.selection", { state: i } = n, s = i.changeByRange((r) => {
    let { from: o, to: l } = r;
    if (o == l) {
      let a = t(r);
      a < o ? (e = "delete.backward", a = cn(n, a, !1)) : a > o && (e = "delete.forward", a = cn(n, a, !0)), o = Math.min(o, a), l = Math.max(l, a);
    } else
      o = cn(n, o, !1), l = cn(n, l, !0);
    return o == l ? { range: r } : { changes: { from: o, to: l }, range: x.cursor(o, o < r.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (n.dispatch(i.update(s, {
    scrollIntoView: !0,
    userEvent: e,
    effects: e == "delete.selection" ? D.announce.of(i.phrase("Selection deleted")) : void 0
  })), !0);
}
function cn(n, t, e) {
  if (n instanceof D)
    for (let i of n.state.facet(D.atomicRanges).map((s) => s(n)))
      i.between(t, t, (s, r) => {
        s < t && r > t && (t = e ? r : s);
      });
  return t;
}
const sc = (n, t, e) => $i(n, (i) => {
  let s = i.from, { state: r } = n, o = r.doc.lineAt(s), l, a;
  if (e && !t && s > o.from && s < o.from + 200 && !/[^ \t]/.test(l = o.text.slice(0, s - o.from))) {
    if (l[l.length - 1] == "	")
      return s - 1;
    let c = ii(l, r.tabSize), h = c % Nn(r) || Nn(r);
    for (let f = 0; f < h && l[l.length - 1 - f] == " "; f++)
      s--;
    a = s;
  } else
    a = lt(o.text, s - o.from, t, t) + o.from, a == s && o.number != (t ? r.doc.lines : 1) ? a += t ? 1 : -1 : !t && /[\ufe00-\ufe0f]/.test(o.text.slice(a - o.from, s - o.from)) && (a = lt(o.text, a - o.from, !1, !1) + o.from);
  return a;
}), Sr = (n) => sc(n, !1, !0), rc = (n) => sc(n, !0, !1), oc = (n, t) => $i(n, (e) => {
  let i = e.head, { state: s } = n, r = s.doc.lineAt(i), o = s.charCategorizer(i);
  for (let l = null; ; ) {
    if (i == (t ? r.to : r.from)) {
      i == e.head && r.number != (t ? s.doc.lines : 1) && (i += t ? 1 : -1);
      break;
    }
    let a = lt(r.text, i - r.from, t) + r.from, c = r.text.slice(Math.min(i, a) - r.from, Math.max(i, a) - r.from), h = o(c);
    if (l != null && h != l)
      break;
    (c != " " || i != e.head) && (l = h), i = a;
  }
  return i;
}), lc = (n) => oc(n, !1), Lm = (n) => oc(n, !0), Rm = (n) => $i(n, (t) => {
  let e = n.lineBlockAt(t.head).to;
  return t.head < e ? e : Math.min(n.state.doc.length, t.head + 1);
}), Pm = (n) => $i(n, (t) => {
  let e = n.moveToLineBoundary(t, !1).head;
  return t.head > e ? e : Math.max(0, t.head - 1);
}), Em = (n) => $i(n, (t) => {
  let e = n.moveToLineBoundary(t, !0).head;
  return t.head < e ? e : Math.min(n.state.doc.length, t.head + 1);
}), Im = ({ state: n, dispatch: t }) => {
  if (n.readOnly)
    return !1;
  let e = n.changeByRange((i) => ({
    changes: { from: i.from, to: i.to, insert: V.of(["", ""]) },
    range: x.cursor(i.from)
  }));
  return t(n.update(e, { scrollIntoView: !0, userEvent: "input" })), !0;
}, Nm = ({ state: n, dispatch: t }) => {
  if (n.readOnly)
    return !1;
  let e = n.changeByRange((i) => {
    if (!i.empty || i.from == 0 || i.from == n.doc.length)
      return { range: i };
    let s = i.from, r = n.doc.lineAt(s), o = s == r.from ? s - 1 : lt(r.text, s - r.from, !1) + r.from, l = s == r.to ? s + 1 : lt(r.text, s - r.from, !0) + r.from;
    return {
      changes: { from: o, to: l, insert: n.doc.slice(s, l).append(n.doc.slice(o, s)) },
      range: x.cursor(l)
    };
  });
  return e.changes.empty ? !1 : (t(n.update(e, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function rs(n) {
  let t = [], e = -1;
  for (let i of n.selection.ranges) {
    let s = n.doc.lineAt(i.from), r = n.doc.lineAt(i.to);
    if (!i.empty && i.to == r.from && (r = n.doc.lineAt(i.to - 1)), e >= s.number) {
      let o = t[t.length - 1];
      o.to = r.to, o.ranges.push(i);
    } else
      t.push({ from: s.from, to: r.to, ranges: [i] });
    e = r.number + 1;
  }
  return t;
}
function ac(n, t, e) {
  if (n.readOnly)
    return !1;
  let i = [], s = [];
  for (let r of rs(n)) {
    if (e ? r.to == n.doc.length : r.from == 0)
      continue;
    let o = n.doc.lineAt(e ? r.to + 1 : r.from - 1), l = o.length + 1;
    if (e) {
      i.push({ from: r.to, to: o.to }, { from: r.from, insert: o.text + n.lineBreak });
      for (let a of r.ranges)
        s.push(x.range(Math.min(n.doc.length, a.anchor + l), Math.min(n.doc.length, a.head + l)));
    } else {
      i.push({ from: o.from, to: r.from }, { from: r.to, insert: n.lineBreak + o.text });
      for (let a of r.ranges)
        s.push(x.range(a.anchor - l, a.head - l));
    }
  }
  return i.length ? (t(n.update({
    changes: i,
    scrollIntoView: !0,
    selection: x.create(s, n.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const Fm = ({ state: n, dispatch: t }) => ac(n, t, !1), Hm = ({ state: n, dispatch: t }) => ac(n, t, !0);
function hc(n, t, e) {
  if (n.readOnly)
    return !1;
  let i = [];
  for (let s of rs(n))
    e ? i.push({ from: s.from, insert: n.doc.slice(s.from, s.to) + n.lineBreak }) : i.push({ from: s.to, insert: n.lineBreak + n.doc.slice(s.from, s.to) });
  return t(n.update({ changes: i, scrollIntoView: !0, userEvent: "input.copyline" })), !0;
}
const Vm = ({ state: n, dispatch: t }) => hc(n, t, !1), Wm = ({ state: n, dispatch: t }) => hc(n, t, !0), zm = (n) => {
  if (n.state.readOnly)
    return !1;
  let { state: t } = n, e = t.changes(rs(t).map(({ from: s, to: r }) => (s > 0 ? s-- : r < t.doc.length && r++, { from: s, to: r }))), i = ni(t.selection, (s) => {
    let r;
    if (n.lineWrapping) {
      let o = n.lineBlockAt(s.head), l = n.coordsAtPos(s.head, s.assoc || 1);
      l && (r = o.bottom + n.documentTop - l.bottom + n.defaultLineHeight / 2);
    }
    return n.moveVertically(s, !0, r);
  }).map(e);
  return n.dispatch({ changes: e, selection: i, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function qm(n, t) {
  if (/\(\)|\[\]|\{\}/.test(n.sliceDoc(t - 1, t + 1)))
    return { from: t, to: t };
  let e = ut(n).resolveInner(t), i = e.childBefore(t), s = e.childAfter(t), r;
  return i && s && i.to <= t && s.from >= t && (r = i.type.prop(N.closedBy)) && r.indexOf(s.name) > -1 && n.doc.lineAt(i.to).from == n.doc.lineAt(s.from).from && !/\S/.test(n.sliceDoc(i.to, s.from)) ? { from: i.to, to: s.from } : null;
}
const Ol = /* @__PURE__ */ cc(!1), $m = /* @__PURE__ */ cc(!0);
function cc(n) {
  return ({ state: t, dispatch: e }) => {
    if (t.readOnly)
      return !1;
    let i = t.changeByRange((s) => {
      let { from: r, to: o } = s, l = t.doc.lineAt(r), a = !n && r == o && qm(t, r);
      n && (r = o = (o <= l.to ? l : t.doc.lineAt(o)).to);
      let c = new ts(t, { simulateBreak: r, simulateDoubleBreak: !!a }), h = Ur(c, r);
      for (h == null && (h = ii(/^\s*/.exec(t.doc.lineAt(r).text)[0], t.tabSize)); o < l.to && /\s/.test(l.text[o - l.from]); )
        o++;
      a ? { from: r, to: o } = a : r > l.from && r < l.from + 100 && !/\S/.test(l.text.slice(0, r)) && (r = l.from);
      let f = ["", Ri(t, h)];
      return a && f.push(Ri(t, c.lineIndent(l.from, -1))), {
        changes: { from: r, to: o, insert: V.of(f) },
        range: x.cursor(r + 1 + f[1].length)
      };
    });
    return e(t.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function Jr(n, t) {
  let e = -1;
  return n.changeByRange((i) => {
    let s = [];
    for (let o = i.from; o <= i.to; ) {
      let l = n.doc.lineAt(o);
      l.number > e && (i.empty || i.to > l.from) && (t(l, s, i), e = l.number), o = l.to + 1;
    }
    let r = n.changes(s);
    return {
      changes: s,
      range: x.range(r.mapPos(i.anchor, 1), r.mapPos(i.head, 1))
    };
  });
}
const Km = ({ state: n, dispatch: t }) => {
  if (n.readOnly)
    return !1;
  let e = /* @__PURE__ */ Object.create(null), i = new ts(n, { overrideIndentation: (r) => {
    let o = e[r];
    return o ?? -1;
  } }), s = Jr(n, (r, o, l) => {
    let a = Ur(i, r.from);
    if (a == null)
      return;
    /\S/.test(r.text) || (a = 0);
    let c = /^\s*/.exec(r.text)[0], h = Ri(n, a);
    (c != h || l.from < r.from + c.length) && (e[r.from] = a, o.push({ from: r.from, to: r.from + c.length, insert: h }));
  });
  return s.changes.empty || t(n.update(s, { userEvent: "indent" })), !0;
}, jm = ({ state: n, dispatch: t }) => n.readOnly ? !1 : (t(n.update(Jr(n, (e, i) => {
  i.push({ from: e.from, insert: n.facet(jr) });
}), { userEvent: "input.indent" })), !0), Um = ({ state: n, dispatch: t }) => n.readOnly ? !1 : (t(n.update(Jr(n, (e, i) => {
  let s = /^\s*/.exec(e.text)[0];
  if (!s)
    return;
  let r = ii(s, n.tabSize), o = 0, l = Ri(n, Math.max(0, r - Nn(n)));
  for (; o < s.length && o < l.length && s.charCodeAt(o) == l.charCodeAt(o); )
    o++;
  i.push({ from: e.from + o, to: e.from + s.length, insert: l.slice(o) });
}), { userEvent: "delete.dedent" })), !0), Gm = (n) => (n.setTabFocusMode(), !0), Ym = [
  { key: "Ctrl-b", run: qh, shift: Xh, preventDefault: !0 },
  { key: "Ctrl-f", run: $h, shift: Qh },
  { key: "Ctrl-p", run: Uh, shift: ec },
  { key: "Ctrl-n", run: Gh, shift: ic },
  { key: "Ctrl-a", run: dm, shift: Am },
  { key: "Ctrl-e", run: pm, shift: Mm },
  { key: "Ctrl-d", run: rc },
  { key: "Ctrl-h", run: Sr },
  { key: "Ctrl-k", run: Rm },
  { key: "Ctrl-Alt-h", run: lc },
  { key: "Ctrl-o", run: Im },
  { key: "Ctrl-t", run: Nm },
  { key: "Ctrl-v", run: kr }
], _m = /* @__PURE__ */ [
  { key: "ArrowLeft", run: qh, shift: Xh, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: sm, shift: ym, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: fm, shift: Sm, preventDefault: !0 },
  { key: "ArrowRight", run: $h, shift: Qh, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: rm, shift: bm, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: um, shift: Cm, preventDefault: !0 },
  { key: "ArrowUp", run: Uh, shift: ec, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: Cl, shift: Ml },
  { mac: "Ctrl-ArrowUp", run: vl, shift: kl },
  { key: "ArrowDown", run: Gh, shift: ic, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: Al, shift: Dl },
  { mac: "Ctrl-ArrowDown", run: kr, shift: Sl },
  { key: "PageUp", run: vl, shift: kl },
  { key: "PageDown", run: kr, shift: Sl },
  { key: "Home", run: cm, shift: km, preventDefault: !0 },
  { key: "Mod-Home", run: Cl, shift: Ml },
  { key: "End", run: hm, shift: vm, preventDefault: !0 },
  { key: "Mod-End", run: Al, shift: Dl },
  { key: "Enter", run: Ol, shift: Ol },
  { key: "Mod-a", run: Dm },
  { key: "Backspace", run: Sr, shift: Sr },
  { key: "Delete", run: rc },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: lc },
  { key: "Mod-Delete", mac: "Alt-Delete", run: Lm },
  { mac: "Mod-Backspace", run: Pm },
  { mac: "Mod-Delete", run: Em }
].concat(/* @__PURE__ */ Ym.map((n) => ({ mac: n.key, run: n.run, shift: n.shift }))), Jm = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: lm, shift: xm },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: am, shift: wm },
  { key: "Alt-ArrowUp", run: Fm },
  { key: "Shift-Alt-ArrowUp", run: Vm },
  { key: "Alt-ArrowDown", run: Hm },
  { key: "Shift-Alt-ArrowDown", run: Wm },
  { key: "Escape", run: Bm },
  { key: "Mod-Enter", run: $m },
  { key: "Alt-l", mac: "Ctrl-l", run: Om },
  { key: "Mod-i", run: Tm, preventDefault: !0 },
  { key: "Mod-[", run: Um },
  { key: "Mod-]", run: jm },
  { key: "Mod-Alt-\\", run: Km },
  { key: "Shift-Mod-k", run: zm },
  { key: "Shift-Mod-\\", run: gm },
  { key: "Mod-/", run: Vp },
  { key: "Alt-A", run: zp },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: Gm }
].concat(_m);
function U() {
  var n = arguments[0];
  typeof n == "string" && (n = document.createElement(n));
  var t = 1, e = arguments[1];
  if (e && typeof e == "object" && e.nodeType == null && !Array.isArray(e)) {
    for (var i in e) if (Object.prototype.hasOwnProperty.call(e, i)) {
      var s = e[i];
      typeof s == "string" ? n.setAttribute(i, s) : s != null && (n[i] = s);
    }
    t++;
  }
  for (; t < arguments.length; t++) fc(n, arguments[t]);
  return n;
}
function fc(n, t) {
  if (typeof t == "string")
    n.appendChild(document.createTextNode(t));
  else if (t != null) if (t.nodeType != null)
    n.appendChild(t);
  else if (Array.isArray(t))
    for (var e = 0; e < t.length; e++) fc(n, t[e]);
  else
    throw new RangeError("Unsupported child node: " + t);
}
const Tl = typeof String.prototype.normalize == "function" ? (n) => n.normalize("NFKD") : (n) => n;
class ti {
  /**
  Create a text cursor. The query is the search string, `from` to
  `to` provides the region to search.
  
  When `normalize` is given, it will be called, on both the query
  string and the content it is matched against, before comparing.
  You can, for example, create a case-insensitive search by
  passing `s => s.toLowerCase()`.
  
  Text is always normalized with
  [`.normalize("NFKD")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
  (when supported).
  */
  constructor(t, e, i = 0, s = t.length, r, o) {
    this.test = o, this.value = { from: 0, to: 0 }, this.done = !1, this.matches = [], this.buffer = "", this.bufferPos = 0, this.iter = t.iterRange(i, s), this.bufferStart = i, this.normalize = r ? (l) => r(Tl(l)) : Tl, this.query = this.normalize(e);
  }
  peek() {
    if (this.bufferPos == this.buffer.length) {
      if (this.bufferStart += this.buffer.length, this.iter.next(), this.iter.done)
        return -1;
      this.bufferPos = 0, this.buffer = this.iter.value;
    }
    return st(this.buffer, this.bufferPos);
  }
  /**
  Look for the next match. Updates the iterator's
  [`value`](https://codemirror.net/6/docs/ref/#search.SearchCursor.value) and
  [`done`](https://codemirror.net/6/docs/ref/#search.SearchCursor.done) properties. Should be called
  at least once before using the cursor.
  */
  next() {
    for (; this.matches.length; )
      this.matches.pop();
    return this.nextOverlapping();
  }
  /**
  The `next` method will ignore matches that partially overlap a
  previous match. This method behaves like `next`, but includes
  such matches.
  */
  nextOverlapping() {
    for (; ; ) {
      let t = this.peek();
      if (t < 0)
        return this.done = !0, this;
      let e = Mr(t), i = this.bufferStart + this.bufferPos;
      this.bufferPos += Bt(t);
      let s = this.normalize(e);
      for (let r = 0, o = i; ; r++) {
        let l = s.charCodeAt(r), a = this.match(l, o, this.bufferPos + this.bufferStart);
        if (r == s.length - 1) {
          if (a)
            return this.value = a, this;
          break;
        }
        o == i && r < e.length && e.charCodeAt(r) == l && o++;
      }
    }
  }
  match(t, e, i) {
    let s = null;
    for (let r = 0; r < this.matches.length; r += 2) {
      let o = this.matches[r], l = !1;
      this.query.charCodeAt(o) == t && (o == this.query.length - 1 ? s = { from: this.matches[r + 1], to: i } : (this.matches[r]++, l = !0)), l || (this.matches.splice(r, 2), r -= 2);
    }
    return this.query.charCodeAt(0) == t && (this.query.length == 1 ? s = { from: e, to: i } : this.matches.push(1, e)), s && this.test && !this.test(s.from, s.to, this.buffer, this.bufferStart) && (s = null), s;
  }
}
typeof Symbol < "u" && (ti.prototype[Symbol.iterator] = function() {
  return this;
});
const uc = { from: -1, to: -1, match: /* @__PURE__ */ /.*/.exec("") }, Xr = "gm" + (/x/.unicode == null ? "" : "u");
class dc {
  /**
  Create a cursor that will search the given range in the given
  document. `query` should be the raw pattern (as you'd pass it to
  `new RegExp`).
  */
  constructor(t, e, i, s = 0, r = t.length) {
    if (this.text = t, this.to = r, this.curLine = "", this.done = !1, this.value = uc, /\\[sWDnr]|\n|\r|\[\^/.test(e))
      return new pc(t, e, i, s, r);
    this.re = new RegExp(e, Xr + (i != null && i.ignoreCase ? "i" : "")), this.test = i == null ? void 0 : i.test, this.iter = t.iter();
    let o = t.lineAt(s);
    this.curLineStart = o.from, this.matchPos = Wn(t, s), this.getLine(this.curLineStart);
  }
  getLine(t) {
    this.iter.next(t), this.iter.lineBreak ? this.curLine = "" : (this.curLine = this.iter.value, this.curLineStart + this.curLine.length > this.to && (this.curLine = this.curLine.slice(0, this.to - this.curLineStart)), this.iter.next());
  }
  nextLine() {
    this.curLineStart = this.curLineStart + this.curLine.length + 1, this.curLineStart > this.to ? this.curLine = "" : this.getLine(0);
  }
  /**
  Move to the next match, if there is one.
  */
  next() {
    for (let t = this.matchPos - this.curLineStart; ; ) {
      this.re.lastIndex = t;
      let e = this.matchPos <= this.to && this.re.exec(this.curLine);
      if (e) {
        let i = this.curLineStart + e.index, s = i + e[0].length;
        if (this.matchPos = Wn(this.text, s + (i == s ? 1 : 0)), i == this.curLineStart + this.curLine.length && this.nextLine(), (i < s || i > this.value.to) && (!this.test || this.test(i, s, e)))
          return this.value = { from: i, to: s, match: e }, this;
        t = this.matchPos - this.curLineStart;
      } else if (this.curLineStart + this.curLine.length < this.to)
        this.nextLine(), t = 0;
      else
        return this.done = !0, this;
    }
  }
}
const Ds = /* @__PURE__ */ new WeakMap();
class Ge {
  constructor(t, e) {
    this.from = t, this.text = e;
  }
  get to() {
    return this.from + this.text.length;
  }
  static get(t, e, i) {
    let s = Ds.get(t);
    if (!s || s.from >= i || s.to <= e) {
      let l = new Ge(e, t.sliceString(e, i));
      return Ds.set(t, l), l;
    }
    if (s.from == e && s.to == i)
      return s;
    let { text: r, from: o } = s;
    return o > e && (r = t.sliceString(e, o) + r, o = e), s.to < i && (r += t.sliceString(s.to, i)), Ds.set(t, new Ge(o, r)), new Ge(e, r.slice(e - o, i - o));
  }
}
class pc {
  constructor(t, e, i, s, r) {
    this.text = t, this.to = r, this.done = !1, this.value = uc, this.matchPos = Wn(t, s), this.re = new RegExp(e, Xr + (i != null && i.ignoreCase ? "i" : "")), this.test = i == null ? void 0 : i.test, this.flat = Ge.get(t, s, this.chunkEnd(
      s + 5e3
      /* Chunk.Base */
    ));
  }
  chunkEnd(t) {
    return t >= this.to ? this.to : this.text.lineAt(t).to;
  }
  next() {
    for (; ; ) {
      let t = this.re.lastIndex = this.matchPos - this.flat.from, e = this.re.exec(this.flat.text);
      if (e && !e[0] && e.index == t && (this.re.lastIndex = t + 1, e = this.re.exec(this.flat.text)), e) {
        let i = this.flat.from + e.index, s = i + e[0].length;
        if ((this.flat.to >= this.to || e.index + e[0].length <= this.flat.text.length - 10) && (!this.test || this.test(i, s, e)))
          return this.value = { from: i, to: s, match: e }, this.matchPos = Wn(this.text, s + (i == s ? 1 : 0)), this;
      }
      if (this.flat.to == this.to)
        return this.done = !0, this;
      this.flat = Ge.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
    }
  }
}
typeof Symbol < "u" && (dc.prototype[Symbol.iterator] = pc.prototype[Symbol.iterator] = function() {
  return this;
});
function Xm(n) {
  try {
    return new RegExp(n, Xr), !0;
  } catch {
    return !1;
  }
}
function Wn(n, t) {
  if (t >= n.length)
    return t;
  let e = n.lineAt(t), i;
  for (; t < e.to && (i = e.text.charCodeAt(t - e.from)) >= 56320 && i < 57344; )
    t++;
  return t;
}
function Cr(n) {
  let t = String(n.state.doc.lineAt(n.state.selection.main.head).number), e = U("input", { class: "cm-textfield", name: "line", value: t }), i = U("form", {
    class: "cm-gotoLine",
    onkeydown: (r) => {
      r.keyCode == 27 ? (r.preventDefault(), n.dispatch({ effects: zn.of(!1) }), n.focus()) : r.keyCode == 13 && (r.preventDefault(), s());
    },
    onsubmit: (r) => {
      r.preventDefault(), s();
    }
  }, U("label", n.state.phrase("Go to line"), ": ", e), " ", U("button", { class: "cm-button", type: "submit" }, n.state.phrase("go")));
  function s() {
    let r = /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(e.value);
    if (!r)
      return;
    let { state: o } = n, l = o.doc.lineAt(o.selection.main.head), [, a, c, h, f] = r, u = h ? +h.slice(1) : 0, d = c ? +c : l.number;
    if (c && f) {
      let y = d / 100;
      a && (y = y * (a == "-" ? -1 : 1) + l.number / o.doc.lines), d = Math.round(o.doc.lines * y);
    } else c && a && (d = d * (a == "-" ? -1 : 1) + l.number);
    let p = o.doc.line(Math.max(1, Math.min(o.doc.lines, d))), g = x.cursor(p.from + Math.max(0, Math.min(u, p.length)));
    n.dispatch({
      effects: [zn.of(!1), D.scrollIntoView(g.from, { y: "center" })],
      selection: g
    }), n.focus();
  }
  return { dom: i };
}
const zn = /* @__PURE__ */ R.define(), Bl = /* @__PURE__ */ at.define({
  create() {
    return !0;
  },
  update(n, t) {
    for (let e of t.effects)
      e.is(zn) && (n = e.value);
    return n;
  },
  provide: (n) => Bi.from(n, (t) => t ? Cr : null)
}), Qm = (n) => {
  let t = Ti(n, Cr);
  if (!t) {
    let e = [zn.of(!0)];
    n.state.field(Bl, !1) == null && e.push(R.appendConfig.of([Bl, Zm])), n.dispatch({ effects: e }), t = Ti(n, Cr);
  }
  return t && t.dom.querySelector("input").select(), !0;
}, Zm = /* @__PURE__ */ D.baseTheme({
  ".cm-panel.cm-gotoLine": {
    padding: "2px 6px 4px",
    "& label": { fontSize: "80%" }
  }
}), tg = {
  highlightWordAroundCursor: !1,
  minSelectionLength: 1,
  maxMatches: 100,
  wholeWords: !1
}, eg = /* @__PURE__ */ O.define({
  combine(n) {
    return Zt(n, tg, {
      highlightWordAroundCursor: (t, e) => t || e,
      minSelectionLength: Math.min,
      maxMatches: Math.min
    });
  }
});
function ig(n) {
  return [lg, og];
}
const ng = /* @__PURE__ */ B.mark({ class: "cm-selectionMatch" }), sg = /* @__PURE__ */ B.mark({ class: "cm-selectionMatch cm-selectionMatch-main" });
function Ll(n, t, e, i) {
  return (e == 0 || n(t.sliceDoc(e - 1, e)) != _.Word) && (i == t.doc.length || n(t.sliceDoc(i, i + 1)) != _.Word);
}
function rg(n, t, e, i) {
  return n(t.sliceDoc(e, e + 1)) == _.Word && n(t.sliceDoc(i - 1, i)) == _.Word;
}
const og = /* @__PURE__ */ Q.fromClass(class {
  constructor(n) {
    this.decorations = this.getDeco(n);
  }
  update(n) {
    (n.selectionSet || n.docChanged || n.viewportChanged) && (this.decorations = this.getDeco(n.view));
  }
  getDeco(n) {
    let t = n.state.facet(eg), { state: e } = n, i = e.selection;
    if (i.ranges.length > 1)
      return B.none;
    let s = i.main, r, o = null;
    if (s.empty) {
      if (!t.highlightWordAroundCursor)
        return B.none;
      let a = e.wordAt(s.head);
      if (!a)
        return B.none;
      o = e.charCategorizer(s.head), r = e.sliceDoc(a.from, a.to);
    } else {
      let a = s.to - s.from;
      if (a < t.minSelectionLength || a > 200)
        return B.none;
      if (t.wholeWords) {
        if (r = e.sliceDoc(s.from, s.to), o = e.charCategorizer(s.head), !(Ll(o, e, s.from, s.to) && rg(o, e, s.from, s.to)))
          return B.none;
      } else if (r = e.sliceDoc(s.from, s.to), !r)
        return B.none;
    }
    let l = [];
    for (let a of n.visibleRanges) {
      let c = new ti(e.doc, r, a.from, a.to);
      for (; !c.next().done; ) {
        let { from: h, to: f } = c.value;
        if ((!o || Ll(o, e, h, f)) && (s.empty && h <= s.from && f >= s.to ? l.push(sg.range(h, f)) : (h >= s.to || f <= s.from) && l.push(ng.range(h, f)), l.length > t.maxMatches))
          return B.none;
      }
    }
    return B.set(l);
  }
}, {
  decorations: (n) => n.decorations
}), lg = /* @__PURE__ */ D.baseTheme({
  ".cm-selectionMatch": { backgroundColor: "#99ff7780" },
  ".cm-searchMatch .cm-selectionMatch": { backgroundColor: "transparent" }
}), ag = ({ state: n, dispatch: t }) => {
  let { selection: e } = n, i = x.create(e.ranges.map((s) => n.wordAt(s.head) || x.cursor(s.head)), e.mainIndex);
  return i.eq(e) ? !1 : (t(n.update({ selection: i })), !0);
};
function hg(n, t) {
  let { main: e, ranges: i } = n.selection, s = n.wordAt(e.head), r = s && s.from == e.from && s.to == e.to;
  for (let o = !1, l = new ti(n.doc, t, i[i.length - 1].to); ; )
    if (l.next(), l.done) {
      if (o)
        return null;
      l = new ti(n.doc, t, 0, Math.max(0, i[i.length - 1].from - 1)), o = !0;
    } else {
      if (o && i.some((a) => a.from == l.value.from))
        continue;
      if (r) {
        let a = n.wordAt(l.value.from);
        if (!a || a.from != l.value.from || a.to != l.value.to)
          continue;
      }
      return l.value;
    }
}
const cg = ({ state: n, dispatch: t }) => {
  let { ranges: e } = n.selection;
  if (e.some((r) => r.from === r.to))
    return ag({ state: n, dispatch: t });
  let i = n.sliceDoc(e[0].from, e[0].to);
  if (n.selection.ranges.some((r) => n.sliceDoc(r.from, r.to) != i))
    return !1;
  let s = hg(n, i);
  return s ? (t(n.update({
    selection: n.selection.addRange(x.range(s.from, s.to), !1),
    effects: D.scrollIntoView(s.to)
  })), !0) : !1;
}, si = /* @__PURE__ */ O.define({
  combine(n) {
    return Zt(n, {
      top: !1,
      caseSensitive: !1,
      literal: !1,
      regexp: !1,
      wholeWord: !1,
      createPanel: (t) => new kg(t),
      scrollToMatch: (t) => D.scrollIntoView(t)
    });
  }
});
class mc {
  /**
  Create a query object.
  */
  constructor(t) {
    this.search = t.search, this.caseSensitive = !!t.caseSensitive, this.literal = !!t.literal, this.regexp = !!t.regexp, this.replace = t.replace || "", this.valid = !!this.search && (!this.regexp || Xm(this.search)), this.unquoted = this.unquote(this.search), this.wholeWord = !!t.wholeWord;
  }
  /**
  @internal
  */
  unquote(t) {
    return this.literal ? t : t.replace(/\\([nrt\\])/g, (e, i) => i == "n" ? `
` : i == "r" ? "\r" : i == "t" ? "	" : "\\");
  }
  /**
  Compare this query to another query.
  */
  eq(t) {
    return this.search == t.search && this.replace == t.replace && this.caseSensitive == t.caseSensitive && this.regexp == t.regexp && this.wholeWord == t.wholeWord;
  }
  /**
  @internal
  */
  create() {
    return this.regexp ? new pg(this) : new ug(this);
  }
  /**
  Get a search cursor for this query, searching through the given
  range in the given state.
  */
  getCursor(t, e = 0, i) {
    let s = t.doc ? t : F.create({ doc: t });
    return i == null && (i = s.doc.length), this.regexp ? We(this, s, e, i) : Ve(this, s, e, i);
  }
}
class gc {
  constructor(t) {
    this.spec = t;
  }
}
function Ve(n, t, e, i) {
  return new ti(t.doc, n.unquoted, e, i, n.caseSensitive ? void 0 : (s) => s.toLowerCase(), n.wholeWord ? fg(t.doc, t.charCategorizer(t.selection.main.head)) : void 0);
}
function fg(n, t) {
  return (e, i, s, r) => ((r > e || r + s.length < i) && (r = Math.max(0, e - 2), s = n.sliceString(r, Math.min(n.length, i + 2))), (t(qn(s, e - r)) != _.Word || t($n(s, e - r)) != _.Word) && (t($n(s, i - r)) != _.Word || t(qn(s, i - r)) != _.Word));
}
class ug extends gc {
  constructor(t) {
    super(t);
  }
  nextMatch(t, e, i) {
    let s = Ve(this.spec, t, i, t.doc.length).nextOverlapping();
    return s.done && (s = Ve(this.spec, t, 0, e).nextOverlapping()), s.done ? null : s.value;
  }
  // Searching in reverse is, rather than implementing an inverted search
  // cursor, done by scanning chunk after chunk forward.
  prevMatchInRange(t, e, i) {
    for (let s = i; ; ) {
      let r = Math.max(e, s - 1e4 - this.spec.unquoted.length), o = Ve(this.spec, t, r, s), l = null;
      for (; !o.nextOverlapping().done; )
        l = o.value;
      if (l)
        return l;
      if (r == e)
        return null;
      s -= 1e4;
    }
  }
  prevMatch(t, e, i) {
    return this.prevMatchInRange(t, 0, e) || this.prevMatchInRange(t, i, t.doc.length);
  }
  getReplacement(t) {
    return this.spec.unquote(this.spec.replace);
  }
  matchAll(t, e) {
    let i = Ve(this.spec, t, 0, t.doc.length), s = [];
    for (; !i.next().done; ) {
      if (s.length >= e)
        return null;
      s.push(i.value);
    }
    return s;
  }
  highlight(t, e, i, s) {
    let r = Ve(this.spec, t, Math.max(0, e - this.spec.unquoted.length), Math.min(i + this.spec.unquoted.length, t.doc.length));
    for (; !r.next().done; )
      s(r.value.from, r.value.to);
  }
}
function We(n, t, e, i) {
  return new dc(t.doc, n.search, {
    ignoreCase: !n.caseSensitive,
    test: n.wholeWord ? dg(t.charCategorizer(t.selection.main.head)) : void 0
  }, e, i);
}
function qn(n, t) {
  return n.slice(lt(n, t, !1), t);
}
function $n(n, t) {
  return n.slice(t, lt(n, t));
}
function dg(n) {
  return (t, e, i) => !i[0].length || (n(qn(i.input, i.index)) != _.Word || n($n(i.input, i.index)) != _.Word) && (n($n(i.input, i.index + i[0].length)) != _.Word || n(qn(i.input, i.index + i[0].length)) != _.Word);
}
class pg extends gc {
  nextMatch(t, e, i) {
    let s = We(this.spec, t, i, t.doc.length).next();
    return s.done && (s = We(this.spec, t, 0, e).next()), s.done ? null : s.value;
  }
  prevMatchInRange(t, e, i) {
    for (let s = 1; ; s++) {
      let r = Math.max(
        e,
        i - s * 1e4
        /* FindPrev.ChunkSize */
      ), o = We(this.spec, t, r, i), l = null;
      for (; !o.next().done; )
        l = o.value;
      if (l && (r == e || l.from > r + 10))
        return l;
      if (r == e)
        return null;
    }
  }
  prevMatch(t, e, i) {
    return this.prevMatchInRange(t, 0, e) || this.prevMatchInRange(t, i, t.doc.length);
  }
  getReplacement(t) {
    return this.spec.unquote(this.spec.replace).replace(/\$([$&\d+])/g, (e, i) => i == "$" ? "$" : i == "&" ? t.match[0] : i != "0" && +i < t.match.length ? t.match[i] : e);
  }
  matchAll(t, e) {
    let i = We(this.spec, t, 0, t.doc.length), s = [];
    for (; !i.next().done; ) {
      if (s.length >= e)
        return null;
      s.push(i.value);
    }
    return s;
  }
  highlight(t, e, i, s) {
    let r = We(this.spec, t, Math.max(
      0,
      e - 250
      /* RegExp.HighlightMargin */
    ), Math.min(i + 250, t.doc.length));
    for (; !r.next().done; )
      s(r.value.from, r.value.to);
  }
}
const Pi = /* @__PURE__ */ R.define(), Qr = /* @__PURE__ */ R.define(), pe = /* @__PURE__ */ at.define({
  create(n) {
    return new Os(Ar(n).create(), null);
  },
  update(n, t) {
    for (let e of t.effects)
      e.is(Pi) ? n = new Os(e.value.create(), n.panel) : e.is(Qr) && (n = new Os(n.query, e.value ? Zr : null));
    return n;
  },
  provide: (n) => Bi.from(n, (t) => t.panel)
});
class Os {
  constructor(t, e) {
    this.query = t, this.panel = e;
  }
}
const mg = /* @__PURE__ */ B.mark({ class: "cm-searchMatch" }), gg = /* @__PURE__ */ B.mark({ class: "cm-searchMatch cm-searchMatch-selected" }), yg = /* @__PURE__ */ Q.fromClass(class {
  constructor(n) {
    this.view = n, this.decorations = this.highlight(n.state.field(pe));
  }
  update(n) {
    let t = n.state.field(pe);
    (t != n.startState.field(pe) || n.docChanged || n.selectionSet || n.viewportChanged) && (this.decorations = this.highlight(t));
  }
  highlight({ query: n, panel: t }) {
    if (!t || !n.spec.valid)
      return B.none;
    let { view: e } = this, i = new ge();
    for (let s = 0, r = e.visibleRanges, o = r.length; s < o; s++) {
      let { from: l, to: a } = r[s];
      for (; s < o - 1 && a > r[s + 1].from - 2 * 250; )
        a = r[++s].to;
      n.highlight(e.state, l, a, (c, h) => {
        let f = e.state.selection.ranges.some((u) => u.from == c && u.to == h);
        i.add(c, h, f ? gg : mg);
      });
    }
    return i.finish();
  }
}, {
  decorations: (n) => n.decorations
});
function Ki(n) {
  return (t) => {
    let e = t.state.field(pe, !1);
    return e && e.query.spec.valid ? n(t, e) : xc(t);
  };
}
const Kn = /* @__PURE__ */ Ki((n, { query: t }) => {
  let { to: e } = n.state.selection.main, i = t.nextMatch(n.state, e, e);
  if (!i)
    return !1;
  let s = x.single(i.from, i.to), r = n.state.facet(si);
  return n.dispatch({
    selection: s,
    effects: [to(n, i), r.scrollToMatch(s.main, n)],
    userEvent: "select.search"
  }), bc(n), !0;
}), jn = /* @__PURE__ */ Ki((n, { query: t }) => {
  let { state: e } = n, { from: i } = e.selection.main, s = t.prevMatch(e, i, i);
  if (!s)
    return !1;
  let r = x.single(s.from, s.to), o = n.state.facet(si);
  return n.dispatch({
    selection: r,
    effects: [to(n, s), o.scrollToMatch(r.main, n)],
    userEvent: "select.search"
  }), bc(n), !0;
}), bg = /* @__PURE__ */ Ki((n, { query: t }) => {
  let e = t.matchAll(n.state, 1e3);
  return !e || !e.length ? !1 : (n.dispatch({
    selection: x.create(e.map((i) => x.range(i.from, i.to))),
    userEvent: "select.search.matches"
  }), !0);
}), xg = ({ state: n, dispatch: t }) => {
  let e = n.selection;
  if (e.ranges.length > 1 || e.main.empty)
    return !1;
  let { from: i, to: s } = e.main, r = [], o = 0;
  for (let l = new ti(n.doc, n.sliceDoc(i, s)); !l.next().done; ) {
    if (r.length > 1e3)
      return !1;
    l.value.from == i && (o = r.length), r.push(x.range(l.value.from, l.value.to));
  }
  return t(n.update({
    selection: x.create(r, o),
    userEvent: "select.search.matches"
  })), !0;
}, Rl = /* @__PURE__ */ Ki((n, { query: t }) => {
  let { state: e } = n, { from: i, to: s } = e.selection.main;
  if (e.readOnly)
    return !1;
  let r = t.nextMatch(e, i, i);
  if (!r)
    return !1;
  let o = [], l, a, c = [];
  if (r.from == i && r.to == s && (a = e.toText(t.getReplacement(r)), o.push({ from: r.from, to: r.to, insert: a }), r = t.nextMatch(e, r.from, r.to), c.push(D.announce.of(e.phrase("replaced match on line $", e.doc.lineAt(i).number) + "."))), r) {
    let h = o.length == 0 || o[0].from >= r.to ? 0 : r.to - r.from - a.length;
    l = x.single(r.from - h, r.to - h), c.push(to(n, r)), c.push(e.facet(si).scrollToMatch(l.main, n));
  }
  return n.dispatch({
    changes: o,
    selection: l,
    effects: c,
    userEvent: "input.replace"
  }), !0;
}), wg = /* @__PURE__ */ Ki((n, { query: t }) => {
  if (n.state.readOnly)
    return !1;
  let e = t.matchAll(n.state, 1e9).map((s) => {
    let { from: r, to: o } = s;
    return { from: r, to: o, insert: t.getReplacement(s) };
  });
  if (!e.length)
    return !1;
  let i = n.state.phrase("replaced $ matches", e.length) + ".";
  return n.dispatch({
    changes: e,
    effects: D.announce.of(i),
    userEvent: "input.replace.all"
  }), !0;
});
function Zr(n) {
  return n.state.facet(si).createPanel(n);
}
function Ar(n, t) {
  var e, i, s, r, o;
  let l = n.selection.main, a = l.empty || l.to > l.from + 100 ? "" : n.sliceDoc(l.from, l.to);
  if (t && !a)
    return t;
  let c = n.facet(si);
  return new mc({
    search: ((e = t == null ? void 0 : t.literal) !== null && e !== void 0 ? e : c.literal) ? a : a.replace(/\n/g, "\\n"),
    caseSensitive: (i = t == null ? void 0 : t.caseSensitive) !== null && i !== void 0 ? i : c.caseSensitive,
    literal: (s = t == null ? void 0 : t.literal) !== null && s !== void 0 ? s : c.literal,
    regexp: (r = t == null ? void 0 : t.regexp) !== null && r !== void 0 ? r : c.regexp,
    wholeWord: (o = t == null ? void 0 : t.wholeWord) !== null && o !== void 0 ? o : c.wholeWord
  });
}
function yc(n) {
  let t = Ti(n, Zr);
  return t && t.dom.querySelector("[main-field]");
}
function bc(n) {
  let t = yc(n);
  t && t == n.root.activeElement && t.select();
}
const xc = (n) => {
  let t = n.state.field(pe, !1);
  if (t && t.panel) {
    let e = yc(n);
    if (e && e != n.root.activeElement) {
      let i = Ar(n.state, t.query.spec);
      i.valid && n.dispatch({ effects: Pi.of(i) }), e.focus(), e.select();
    }
  } else
    n.dispatch({ effects: [
      Qr.of(!0),
      t ? Pi.of(Ar(n.state, t.query.spec)) : R.appendConfig.of(Cg)
    ] });
  return !0;
}, wc = (n) => {
  let t = n.state.field(pe, !1);
  if (!t || !t.panel)
    return !1;
  let e = Ti(n, Zr);
  return e && e.dom.contains(n.root.activeElement) && n.focus(), n.dispatch({ effects: Qr.of(!1) }), !0;
}, vg = [
  { key: "Mod-f", run: xc, scope: "editor search-panel" },
  { key: "F3", run: Kn, shift: jn, scope: "editor search-panel", preventDefault: !0 },
  { key: "Mod-g", run: Kn, shift: jn, scope: "editor search-panel", preventDefault: !0 },
  { key: "Escape", run: wc, scope: "editor search-panel" },
  { key: "Mod-Shift-l", run: xg },
  { key: "Mod-Alt-g", run: Qm },
  { key: "Mod-d", run: cg, preventDefault: !0 }
];
class kg {
  constructor(t) {
    this.view = t;
    let e = this.query = t.state.field(pe).query.spec;
    this.commit = this.commit.bind(this), this.searchField = U("input", {
      value: e.search,
      placeholder: St(t, "Find"),
      "aria-label": St(t, "Find"),
      class: "cm-textfield",
      name: "search",
      form: "",
      "main-field": "true",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.replaceField = U("input", {
      value: e.replace,
      placeholder: St(t, "Replace"),
      "aria-label": St(t, "Replace"),
      class: "cm-textfield",
      name: "replace",
      form: "",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.caseField = U("input", {
      type: "checkbox",
      name: "case",
      form: "",
      checked: e.caseSensitive,
      onchange: this.commit
    }), this.reField = U("input", {
      type: "checkbox",
      name: "re",
      form: "",
      checked: e.regexp,
      onchange: this.commit
    }), this.wordField = U("input", {
      type: "checkbox",
      name: "word",
      form: "",
      checked: e.wholeWord,
      onchange: this.commit
    });
    function i(s, r, o) {
      return U("button", { class: "cm-button", name: s, onclick: r, type: "button" }, o);
    }
    this.dom = U("div", { onkeydown: (s) => this.keydown(s), class: "cm-search" }, [
      this.searchField,
      i("next", () => Kn(t), [St(t, "next")]),
      i("prev", () => jn(t), [St(t, "previous")]),
      i("select", () => bg(t), [St(t, "all")]),
      U("label", null, [this.caseField, St(t, "match case")]),
      U("label", null, [this.reField, St(t, "regexp")]),
      U("label", null, [this.wordField, St(t, "by word")]),
      ...t.state.readOnly ? [] : [
        U("br"),
        this.replaceField,
        i("replace", () => Rl(t), [St(t, "replace")]),
        i("replaceAll", () => wg(t), [St(t, "replace all")])
      ],
      U("button", {
        name: "close",
        onclick: () => wc(t),
        "aria-label": St(t, "close"),
        type: "button"
      }, ["×"])
    ]);
  }
  commit() {
    let t = new mc({
      search: this.searchField.value,
      caseSensitive: this.caseField.checked,
      regexp: this.reField.checked,
      wholeWord: this.wordField.checked,
      replace: this.replaceField.value
    });
    t.eq(this.query) || (this.query = t, this.view.dispatch({ effects: Pi.of(t) }));
  }
  keydown(t) {
    Tu(this.view, t, "search-panel") ? t.preventDefault() : t.keyCode == 13 && t.target == this.searchField ? (t.preventDefault(), (t.shiftKey ? jn : Kn)(this.view)) : t.keyCode == 13 && t.target == this.replaceField && (t.preventDefault(), Rl(this.view));
  }
  update(t) {
    for (let e of t.transactions)
      for (let i of e.effects)
        i.is(Pi) && !i.value.eq(this.query) && this.setQuery(i.value);
  }
  setQuery(t) {
    this.query = t, this.searchField.value = t.search, this.replaceField.value = t.replace, this.caseField.checked = t.caseSensitive, this.reField.checked = t.regexp, this.wordField.checked = t.wholeWord;
  }
  mount() {
    this.searchField.select();
  }
  get pos() {
    return 80;
  }
  get top() {
    return this.view.state.facet(si).top;
  }
}
function St(n, t) {
  return n.state.phrase(t);
}
const fn = 30, un = /[\s\.,:;?!]/;
function to(n, { from: t, to: e }) {
  let i = n.state.doc.lineAt(t), s = n.state.doc.lineAt(e).to, r = Math.max(i.from, t - fn), o = Math.min(s, e + fn), l = n.state.sliceDoc(r, o);
  if (r != i.from) {
    for (let a = 0; a < fn; a++)
      if (!un.test(l[a + 1]) && un.test(l[a])) {
        l = l.slice(a);
        break;
      }
  }
  if (o != s) {
    for (let a = l.length - 1; a > l.length - fn; a--)
      if (!un.test(l[a - 1]) && un.test(l[a])) {
        l = l.slice(0, a);
        break;
      }
  }
  return D.announce.of(`${n.state.phrase("current match")}. ${l} ${n.state.phrase("on line")} ${i.number}.`);
}
const Sg = /* @__PURE__ */ D.baseTheme({
  ".cm-panel.cm-search": {
    padding: "2px 6px 4px",
    position: "relative",
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "4px",
      backgroundColor: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    },
    "& input, & button, & label": {
      margin: ".2em .6em .2em 0"
    },
    "& input[type=checkbox]": {
      marginRight: ".2em"
    },
    "& label": {
      fontSize: "80%",
      whiteSpace: "pre"
    }
  },
  "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
  "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" },
  "&light .cm-searchMatch-selected": { backgroundColor: "#ff6a0054" },
  "&dark .cm-searchMatch-selected": { backgroundColor: "#ff00ff8a" }
}), Cg = [
  pe,
  /* @__PURE__ */ Ne.low(yg),
  Sg
];
class vc {
  /**
  Create a new completion context. (Mostly useful for testing
  completion sources—in the editor, the extension will create
  these for you.)
  */
  constructor(t, e, i, s) {
    this.state = t, this.pos = e, this.explicit = i, this.view = s, this.abortListeners = [], this.abortOnDocChange = !1;
  }
  /**
  Get the extent, content, and (if there is a token) type of the
  token before `this.pos`.
  */
  tokenBefore(t) {
    let e = ut(this.state).resolveInner(this.pos, -1);
    for (; e && t.indexOf(e.name) < 0; )
      e = e.parent;
    return e ? {
      from: e.from,
      to: this.pos,
      text: this.state.sliceDoc(e.from, this.pos),
      type: e.type
    } : null;
  }
  /**
  Get the match of the given expression directly before the
  cursor.
  */
  matchBefore(t) {
    let e = this.state.doc.lineAt(this.pos), i = Math.max(e.from, this.pos - 250), s = e.text.slice(i - e.from, this.pos - e.from), r = s.search(kc(t, !1));
    return r < 0 ? null : { from: i + r, to: this.pos, text: s.slice(r) };
  }
  /**
  Yields true when the query has been aborted. Can be useful in
  asynchronous queries to avoid doing work that will be ignored.
  */
  get aborted() {
    return this.abortListeners == null;
  }
  /**
  Allows you to register abort handlers, which will be called when
  the query is
  [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
  
  By default, running queries will not be aborted for regular
  typing or backspacing, on the assumption that they are likely to
  return a result with a
  [`validFor`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.validFor) field that
  allows the result to be used after all. Passing `onDocChange:
  true` will cause this query to be aborted for any document
  change.
  */
  addEventListener(t, e, i) {
    t == "abort" && this.abortListeners && (this.abortListeners.push(e), i && i.onDocChange && (this.abortOnDocChange = !0));
  }
}
function Pl(n) {
  let t = Object.keys(n).join(""), e = /\w/.test(t);
  return e && (t = t.replace(/\w/g, "")), `[${e ? "\\w" : ""}${t.replace(/[^\w\s]/g, "\\$&")}]`;
}
function Ag(n) {
  let t = /* @__PURE__ */ Object.create(null), e = /* @__PURE__ */ Object.create(null);
  for (let { label: s } of n) {
    t[s[0]] = !0;
    for (let r = 1; r < s.length; r++)
      e[s[r]] = !0;
  }
  let i = Pl(t) + Pl(e) + "*$";
  return [new RegExp("^" + i), new RegExp(i)];
}
function Mg(n) {
  let t = n.map((s) => typeof s == "string" ? { label: s } : s), [e, i] = t.every((s) => /^\w+$/.test(s.label)) ? [/\w*$/, /\w+$/] : Ag(t);
  return (s) => {
    let r = s.matchBefore(i);
    return r || s.explicit ? { from: r ? r.from : s.pos, options: t, validFor: e } : null;
  };
}
class El {
  constructor(t, e, i, s) {
    this.completion = t, this.source = e, this.match = i, this.score = s;
  }
}
function me(n) {
  return n.selection.main.from;
}
function kc(n, t) {
  var e;
  let { source: i } = n, s = t && i[0] != "^", r = i[i.length - 1] != "$";
  return !s && !r ? n : new RegExp(`${s ? "^" : ""}(?:${i})${r ? "$" : ""}`, (e = n.flags) !== null && e !== void 0 ? e : n.ignoreCase ? "i" : "");
}
const Sc = /* @__PURE__ */ re.define();
function Dg(n, t, e, i) {
  let { main: s } = n.selection, r = e - s.from, o = i - s.from;
  return Object.assign(Object.assign({}, n.changeByRange((l) => {
    if (l != s && e != i && n.sliceDoc(l.from + r, l.from + o) != n.sliceDoc(e, i))
      return { range: l };
    let a = n.toText(t);
    return {
      changes: { from: l.from + r, to: i == s.from ? l.to : l.from + o, insert: a },
      range: x.cursor(l.from + r + a.length)
    };
  })), { scrollIntoView: !0, userEvent: "input.complete" });
}
const Il = /* @__PURE__ */ new WeakMap();
function Og(n) {
  if (!Array.isArray(n))
    return n;
  let t = Il.get(n);
  return t || Il.set(n, t = Mg(n)), t;
}
const Un = /* @__PURE__ */ R.define(), Ei = /* @__PURE__ */ R.define();
class Tg {
  constructor(t) {
    this.pattern = t, this.chars = [], this.folded = [], this.any = [], this.precise = [], this.byWord = [], this.score = 0, this.matched = [];
    for (let e = 0; e < t.length; ) {
      let i = st(t, e), s = Bt(i);
      this.chars.push(i);
      let r = t.slice(e, e + s), o = r.toUpperCase();
      this.folded.push(st(o == r ? r.toLowerCase() : o, 0)), e += s;
    }
    this.astral = t.length != this.chars.length;
  }
  ret(t, e) {
    return this.score = t, this.matched = e, this;
  }
  // Matches a given word (completion) against the pattern (input).
  // Will return a boolean indicating whether there was a match and,
  // on success, set `this.score` to the score, `this.matched` to an
  // array of `from, to` pairs indicating the matched parts of `word`.
  //
  // The score is a number that is more negative the worse the match
  // is. See `Penalty` above.
  match(t) {
    if (this.pattern.length == 0)
      return this.ret(-100, []);
    if (t.length < this.pattern.length)
      return null;
    let { chars: e, folded: i, any: s, precise: r, byWord: o } = this;
    if (e.length == 1) {
      let w = st(t, 0), k = Bt(w), S = k == t.length ? 0 : -100;
      if (w != e[0]) if (w == i[0])
        S += -200;
      else
        return null;
      return this.ret(S, [0, k]);
    }
    let l = t.indexOf(this.pattern);
    if (l == 0)
      return this.ret(t.length == this.pattern.length ? 0 : -100, [0, this.pattern.length]);
    let a = e.length, c = 0;
    if (l < 0) {
      for (let w = 0, k = Math.min(t.length, 200); w < k && c < a; ) {
        let S = st(t, w);
        (S == e[c] || S == i[c]) && (s[c++] = w), w += Bt(S);
      }
      if (c < a)
        return null;
    }
    let h = 0, f = 0, u = !1, d = 0, p = -1, g = -1, y = /[a-z]/.test(t), b = !0;
    for (let w = 0, k = Math.min(t.length, 200), S = 0; w < k && f < a; ) {
      let v = st(t, w);
      l < 0 && (h < a && v == e[h] && (r[h++] = w), d < a && (v == e[d] || v == i[d] ? (d == 0 && (p = w), g = w + 1, d++) : d = 0));
      let C, M = v < 255 ? v >= 48 && v <= 57 || v >= 97 && v <= 122 ? 2 : v >= 65 && v <= 90 ? 1 : 0 : (C = Mr(v)) != C.toLowerCase() ? 1 : C != C.toUpperCase() ? 2 : 0;
      (!w || M == 1 && y || S == 0 && M != 0) && (e[f] == v || i[f] == v && (u = !0) ? o[f++] = w : o.length && (b = !1)), S = M, w += Bt(v);
    }
    return f == a && o[0] == 0 && b ? this.result(-100 + (u ? -200 : 0), o, t) : d == a && p == 0 ? this.ret(-200 - t.length + (g == t.length ? 0 : -100), [0, g]) : l > -1 ? this.ret(-700 - t.length, [l, l + this.pattern.length]) : d == a ? this.ret(-900 - t.length, [p, g]) : f == a ? this.result(-100 + (u ? -200 : 0) + -700 + (b ? 0 : -1100), o, t) : e.length == 2 ? null : this.result((s[0] ? -700 : 0) + -200 + -1100, s, t);
  }
  result(t, e, i) {
    let s = [], r = 0;
    for (let o of e) {
      let l = o + (this.astral ? Bt(st(i, o)) : 1);
      r && s[r - 1] == o ? s[r - 1] = l : (s[r++] = o, s[r++] = l);
    }
    return this.ret(t - i.length, s);
  }
}
class Bg {
  constructor(t) {
    this.pattern = t, this.matched = [], this.score = 0, this.folded = t.toLowerCase();
  }
  match(t) {
    if (t.length < this.pattern.length)
      return null;
    let e = t.slice(0, this.pattern.length), i = e == this.pattern ? 0 : e.toLowerCase() == this.folded ? -200 : null;
    return i == null ? null : (this.matched = [0, e.length], this.score = i + (t.length == this.pattern.length ? 0 : -100), this);
  }
}
const et = /* @__PURE__ */ O.define({
  combine(n) {
    return Zt(n, {
      activateOnTyping: !0,
      activateOnCompletion: () => !1,
      activateOnTypingDelay: 100,
      selectOnOpen: !0,
      override: null,
      closeOnBlur: !0,
      maxRenderedOptions: 100,
      defaultKeymap: !0,
      tooltipClass: () => "",
      optionClass: () => "",
      aboveCursor: !1,
      icons: !0,
      addToOptions: [],
      positionInfo: Lg,
      filterStrict: !1,
      compareCompletions: (t, e) => t.label.localeCompare(e.label),
      interactionDelay: 75,
      updateSyncTime: 100
    }, {
      defaultKeymap: (t, e) => t && e,
      closeOnBlur: (t, e) => t && e,
      icons: (t, e) => t && e,
      tooltipClass: (t, e) => (i) => Nl(t(i), e(i)),
      optionClass: (t, e) => (i) => Nl(t(i), e(i)),
      addToOptions: (t, e) => t.concat(e),
      filterStrict: (t, e) => t || e
    });
  }
});
function Nl(n, t) {
  return n ? t ? n + " " + t : n : t;
}
function Lg(n, t, e, i, s, r) {
  let o = n.textDirection == Y.RTL, l = o, a = !1, c = "top", h, f, u = t.left - s.left, d = s.right - t.right, p = i.right - i.left, g = i.bottom - i.top;
  if (l && u < Math.min(p, d) ? l = !1 : !l && d < Math.min(p, u) && (l = !0), p <= (l ? u : d))
    h = Math.max(s.top, Math.min(e.top, s.bottom - g)) - t.top, f = Math.min(400, l ? u : d);
  else {
    a = !0, f = Math.min(
      400,
      (o ? t.right : s.right - t.left) - 30
      /* Info.Margin */
    );
    let w = s.bottom - t.bottom;
    w >= g || w > t.top ? h = e.bottom - t.top : (c = "bottom", h = t.bottom - e.top);
  }
  let y = (t.bottom - t.top) / r.offsetHeight, b = (t.right - t.left) / r.offsetWidth;
  return {
    style: `${c}: ${h / y}px; max-width: ${f / b}px`,
    class: "cm-completionInfo-" + (a ? o ? "left-narrow" : "right-narrow" : l ? "left" : "right")
  };
}
function Rg(n) {
  let t = n.addToOptions.slice();
  return n.icons && t.push({
    render(e) {
      let i = document.createElement("div");
      return i.classList.add("cm-completionIcon"), e.type && i.classList.add(...e.type.split(/\s+/g).map((s) => "cm-completionIcon-" + s)), i.setAttribute("aria-hidden", "true"), i;
    },
    position: 20
  }), t.push({
    render(e, i, s, r) {
      let o = document.createElement("span");
      o.className = "cm-completionLabel";
      let l = e.displayLabel || e.label, a = 0;
      for (let c = 0; c < r.length; ) {
        let h = r[c++], f = r[c++];
        h > a && o.appendChild(document.createTextNode(l.slice(a, h)));
        let u = o.appendChild(document.createElement("span"));
        u.appendChild(document.createTextNode(l.slice(h, f))), u.className = "cm-completionMatchedText", a = f;
      }
      return a < l.length && o.appendChild(document.createTextNode(l.slice(a))), o;
    },
    position: 50
  }, {
    render(e) {
      if (!e.detail)
        return null;
      let i = document.createElement("span");
      return i.className = "cm-completionDetail", i.textContent = e.detail, i;
    },
    position: 80
  }), t.sort((e, i) => e.position - i.position).map((e) => e.render);
}
function Ts(n, t, e) {
  if (n <= e)
    return { from: 0, to: n };
  if (t < 0 && (t = 0), t <= n >> 1) {
    let s = Math.floor(t / e);
    return { from: s * e, to: (s + 1) * e };
  }
  let i = Math.floor((n - t) / e);
  return { from: n - (i + 1) * e, to: n - i * e };
}
class Pg {
  constructor(t, e, i) {
    this.view = t, this.stateField = e, this.applyCompletion = i, this.info = null, this.infoDestroy = null, this.placeInfoReq = {
      read: () => this.measureInfo(),
      write: (a) => this.placeInfo(a),
      key: this
    }, this.space = null, this.currentClass = "";
    let s = t.state.field(e), { options: r, selected: o } = s.open, l = t.state.facet(et);
    this.optionContent = Rg(l), this.optionClass = l.optionClass, this.tooltipClass = l.tooltipClass, this.range = Ts(r.length, o, l.maxRenderedOptions), this.dom = document.createElement("div"), this.dom.className = "cm-tooltip-autocomplete", this.updateTooltipClass(t.state), this.dom.addEventListener("mousedown", (a) => {
      let { options: c } = t.state.field(e).open;
      for (let h = a.target, f; h && h != this.dom; h = h.parentNode)
        if (h.nodeName == "LI" && (f = /-(\d+)$/.exec(h.id)) && +f[1] < c.length) {
          this.applyCompletion(t, c[+f[1]]), a.preventDefault();
          return;
        }
    }), this.dom.addEventListener("focusout", (a) => {
      let c = t.state.field(this.stateField, !1);
      c && c.tooltip && t.state.facet(et).closeOnBlur && a.relatedTarget != t.contentDOM && t.dispatch({ effects: Ei.of(null) });
    }), this.showOptions(r, s.id);
  }
  mount() {
    this.updateSel();
  }
  showOptions(t, e) {
    this.list && this.list.remove(), this.list = this.dom.appendChild(this.createListBox(t, e, this.range)), this.list.addEventListener("scroll", () => {
      this.info && this.view.requestMeasure(this.placeInfoReq);
    });
  }
  update(t) {
    var e;
    let i = t.state.field(this.stateField), s = t.startState.field(this.stateField);
    if (this.updateTooltipClass(t.state), i != s) {
      let { options: r, selected: o, disabled: l } = i.open;
      (!s.open || s.open.options != r) && (this.range = Ts(r.length, o, t.state.facet(et).maxRenderedOptions), this.showOptions(r, i.id)), this.updateSel(), l != ((e = s.open) === null || e === void 0 ? void 0 : e.disabled) && this.dom.classList.toggle("cm-tooltip-autocomplete-disabled", !!l);
    }
  }
  updateTooltipClass(t) {
    let e = this.tooltipClass(t);
    if (e != this.currentClass) {
      for (let i of this.currentClass.split(" "))
        i && this.dom.classList.remove(i);
      for (let i of e.split(" "))
        i && this.dom.classList.add(i);
      this.currentClass = e;
    }
  }
  positioned(t) {
    this.space = t, this.info && this.view.requestMeasure(this.placeInfoReq);
  }
  updateSel() {
    let t = this.view.state.field(this.stateField), e = t.open;
    if ((e.selected > -1 && e.selected < this.range.from || e.selected >= this.range.to) && (this.range = Ts(e.options.length, e.selected, this.view.state.facet(et).maxRenderedOptions), this.showOptions(e.options, t.id)), this.updateSelectedOption(e.selected)) {
      this.destroyInfo();
      let { completion: i } = e.options[e.selected], { info: s } = i;
      if (!s)
        return;
      let r = typeof s == "string" ? document.createTextNode(s) : s(i);
      if (!r)
        return;
      "then" in r ? r.then((o) => {
        o && this.view.state.field(this.stateField, !1) == t && this.addInfoPane(o, i);
      }).catch((o) => wt(this.view.state, o, "completion info")) : this.addInfoPane(r, i);
    }
  }
  addInfoPane(t, e) {
    this.destroyInfo();
    let i = this.info = document.createElement("div");
    if (i.className = "cm-tooltip cm-completionInfo", t.nodeType != null)
      i.appendChild(t), this.infoDestroy = null;
    else {
      let { dom: s, destroy: r } = t;
      i.appendChild(s), this.infoDestroy = r || null;
    }
    this.dom.appendChild(i), this.view.requestMeasure(this.placeInfoReq);
  }
  updateSelectedOption(t) {
    let e = null;
    for (let i = this.list.firstChild, s = this.range.from; i; i = i.nextSibling, s++)
      i.nodeName != "LI" || !i.id ? s-- : s == t ? i.hasAttribute("aria-selected") || (i.setAttribute("aria-selected", "true"), e = i) : i.hasAttribute("aria-selected") && i.removeAttribute("aria-selected");
    return e && Ig(this.list, e), e;
  }
  measureInfo() {
    let t = this.dom.querySelector("[aria-selected]");
    if (!t || !this.info)
      return null;
    let e = this.dom.getBoundingClientRect(), i = this.info.getBoundingClientRect(), s = t.getBoundingClientRect(), r = this.space;
    if (!r) {
      let o = this.dom.ownerDocument.defaultView || window;
      r = { left: 0, top: 0, right: o.innerWidth, bottom: o.innerHeight };
    }
    return s.top > Math.min(r.bottom, e.bottom) - 10 || s.bottom < Math.max(r.top, e.top) + 10 ? null : this.view.state.facet(et).positionInfo(this.view, e, s, i, r, this.dom);
  }
  placeInfo(t) {
    this.info && (t ? (t.style && (this.info.style.cssText = t.style), this.info.className = "cm-tooltip cm-completionInfo " + (t.class || "")) : this.info.style.cssText = "top: -1e6px");
  }
  createListBox(t, e, i) {
    const s = document.createElement("ul");
    s.id = e, s.setAttribute("role", "listbox"), s.setAttribute("aria-expanded", "true"), s.setAttribute("aria-label", this.view.state.phrase("Completions"));
    let r = null;
    for (let o = i.from; o < i.to; o++) {
      let { completion: l, match: a } = t[o], { section: c } = l;
      if (c) {
        let u = typeof c == "string" ? c : c.name;
        if (u != r && (o > i.from || i.from == 0))
          if (r = u, typeof c != "string" && c.header)
            s.appendChild(c.header(c));
          else {
            let d = s.appendChild(document.createElement("completion-section"));
            d.textContent = u;
          }
      }
      const h = s.appendChild(document.createElement("li"));
      h.id = e + "-" + o, h.setAttribute("role", "option");
      let f = this.optionClass(l);
      f && (h.className = f);
      for (let u of this.optionContent) {
        let d = u(l, this.view.state, this.view, a);
        d && h.appendChild(d);
      }
    }
    return i.from && s.classList.add("cm-completionListIncompleteTop"), i.to < t.length && s.classList.add("cm-completionListIncompleteBottom"), s;
  }
  destroyInfo() {
    this.info && (this.infoDestroy && this.infoDestroy(), this.info.remove(), this.info = null);
  }
  destroy() {
    this.destroyInfo();
  }
}
function Eg(n, t) {
  return (e) => new Pg(e, n, t);
}
function Ig(n, t) {
  let e = n.getBoundingClientRect(), i = t.getBoundingClientRect(), s = e.height / n.offsetHeight;
  i.top < e.top ? n.scrollTop -= (e.top - i.top) / s : i.bottom > e.bottom && (n.scrollTop += (i.bottom - e.bottom) / s);
}
function Fl(n) {
  return (n.boost || 0) * 100 + (n.apply ? 10 : 0) + (n.info ? 5 : 0) + (n.type ? 1 : 0);
}
function Ng(n, t) {
  let e = [], i = null, s = (c) => {
    e.push(c);
    let { section: h } = c.completion;
    if (h) {
      i || (i = []);
      let f = typeof h == "string" ? h : h.name;
      i.some((u) => u.name == f) || i.push(typeof h == "string" ? { name: f } : h);
    }
  }, r = t.facet(et);
  for (let c of n)
    if (c.hasResult()) {
      let h = c.result.getMatch;
      if (c.result.filter === !1)
        for (let f of c.result.options)
          s(new El(f, c.source, h ? h(f) : [], 1e9 - e.length));
      else {
        let f = t.sliceDoc(c.from, c.to), u, d = r.filterStrict ? new Bg(f) : new Tg(f);
        for (let p of c.result.options)
          if (u = d.match(p.label)) {
            let g = p.displayLabel ? h ? h(p, u.matched) : [] : u.matched;
            s(new El(p, c.source, g, u.score + (p.boost || 0)));
          }
      }
    }
  if (i) {
    let c = /* @__PURE__ */ Object.create(null), h = 0, f = (u, d) => {
      var p, g;
      return ((p = u.rank) !== null && p !== void 0 ? p : 1e9) - ((g = d.rank) !== null && g !== void 0 ? g : 1e9) || (u.name < d.name ? -1 : 1);
    };
    for (let u of i.sort(f))
      h -= 1e5, c[u.name] = h;
    for (let u of e) {
      let { section: d } = u.completion;
      d && (u.score += c[typeof d == "string" ? d : d.name]);
    }
  }
  let o = [], l = null, a = r.compareCompletions;
  for (let c of e.sort((h, f) => f.score - h.score || a(h.completion, f.completion))) {
    let h = c.completion;
    !l || l.label != h.label || l.detail != h.detail || l.type != null && h.type != null && l.type != h.type || l.apply != h.apply || l.boost != h.boost ? o.push(c) : Fl(c.completion) > Fl(l) && (o[o.length - 1] = c), l = c.completion;
  }
  return o;
}
class qe {
  constructor(t, e, i, s, r, o) {
    this.options = t, this.attrs = e, this.tooltip = i, this.timestamp = s, this.selected = r, this.disabled = o;
  }
  setSelected(t, e) {
    return t == this.selected || t >= this.options.length ? this : new qe(this.options, Hl(e, t), this.tooltip, this.timestamp, t, this.disabled);
  }
  static build(t, e, i, s, r, o) {
    if (s && !o && t.some(
      (c) => c.state == 1
      /* State.Pending */
    ))
      return s.setDisabled();
    let l = Ng(t, e);
    if (!l.length)
      return s && t.some(
        (c) => c.state == 1
        /* State.Pending */
      ) ? s.setDisabled() : null;
    let a = e.facet(et).selectOnOpen ? 0 : -1;
    if (s && s.selected != a && s.selected != -1) {
      let c = s.options[s.selected].completion;
      for (let h = 0; h < l.length; h++)
        if (l[h].completion == c) {
          a = h;
          break;
        }
    }
    return new qe(l, Hl(i, a), {
      pos: t.reduce((c, h) => h.hasResult() ? Math.min(c, h.from) : c, 1e8),
      create: qg,
      above: r.aboveCursor
    }, s ? s.timestamp : Date.now(), a, !1);
  }
  map(t) {
    return new qe(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), { pos: t.mapPos(this.tooltip.pos) }), this.timestamp, this.selected, this.disabled);
  }
  setDisabled() {
    return new qe(this.options, this.attrs, this.tooltip, this.timestamp, this.selected, !0);
  }
}
class Gn {
  constructor(t, e, i) {
    this.active = t, this.id = e, this.open = i;
  }
  static start() {
    return new Gn(Wg, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(t) {
    let { state: e } = t, i = e.facet(et), r = (i.override || e.languageDataAt("autocomplete", me(e)).map(Og)).map((a) => (this.active.find((h) => h.source == a) || new At(
      a,
      this.active.some(
        (h) => h.state != 0
        /* State.Inactive */
      ) ? 1 : 0
      /* State.Inactive */
    )).update(t, i));
    r.length == this.active.length && r.every((a, c) => a == this.active[c]) && (r = this.active);
    let o = this.open, l = t.effects.some((a) => a.is(eo));
    o && t.docChanged && (o = o.map(t.changes)), t.selection || r.some((a) => a.hasResult() && t.changes.touchesRange(a.from, a.to)) || !Fg(r, this.active) || l ? o = qe.build(r, e, this.id, o, i, l) : o && o.disabled && !r.some(
      (a) => a.state == 1
      /* State.Pending */
    ) && (o = null), !o && r.every(
      (a) => a.state != 1
      /* State.Pending */
    ) && r.some((a) => a.hasResult()) && (r = r.map((a) => a.hasResult() ? new At(
      a.source,
      0
      /* State.Inactive */
    ) : a));
    for (let a of t.effects)
      a.is(Ac) && (o = o && o.setSelected(a.value, this.id));
    return r == this.active && o == this.open ? this : new Gn(r, this.id, o);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : this.active.length ? Hg : Vg;
  }
}
function Fg(n, t) {
  if (n == t)
    return !0;
  for (let e = 0, i = 0; ; ) {
    for (; e < n.length && !n[e].hasResult; )
      e++;
    for (; i < t.length && !t[i].hasResult; )
      i++;
    let s = e == n.length, r = i == t.length;
    if (s || r)
      return s == r;
    if (n[e++].result != t[i++].result)
      return !1;
  }
}
const Hg = {
  "aria-autocomplete": "list"
}, Vg = {};
function Hl(n, t) {
  let e = {
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": n
  };
  return t > -1 && (e["aria-activedescendant"] = n + "-" + t), e;
}
const Wg = [];
function Cc(n, t) {
  if (n.isUserEvent("input.complete")) {
    let i = n.annotation(Sc);
    if (i && t.activateOnCompletion(i))
      return 12;
  }
  let e = n.isUserEvent("input.type");
  return e && t.activateOnTyping ? 5 : e ? 1 : n.isUserEvent("delete.backward") ? 2 : n.selection ? 8 : n.docChanged ? 16 : 0;
}
class At {
  constructor(t, e, i = -1) {
    this.source = t, this.state = e, this.explicitPos = i;
  }
  hasResult() {
    return !1;
  }
  update(t, e) {
    let i = Cc(t, e), s = this;
    (i & 8 || i & 16 && this.touches(t)) && (s = new At(
      s.source,
      0
      /* State.Inactive */
    )), i & 4 && s.state == 0 && (s = new At(
      this.source,
      1
      /* State.Pending */
    )), s = s.updateFor(t, i);
    for (let r of t.effects)
      if (r.is(Un))
        s = new At(s.source, 1, r.value ? me(t.state) : -1);
      else if (r.is(Ei))
        s = new At(
          s.source,
          0
          /* State.Inactive */
        );
      else if (r.is(eo))
        for (let o of r.value)
          o.source == s.source && (s = o);
    return s;
  }
  updateFor(t, e) {
    return this.map(t.changes);
  }
  map(t) {
    return t.empty || this.explicitPos < 0 ? this : new At(this.source, this.state, t.mapPos(this.explicitPos));
  }
  touches(t) {
    return t.changes.touchesRange(me(t.state));
  }
}
class Ye extends At {
  constructor(t, e, i, s, r) {
    super(t, 2, e), this.result = i, this.from = s, this.to = r;
  }
  hasResult() {
    return !0;
  }
  updateFor(t, e) {
    var i;
    if (!(e & 3))
      return this.map(t.changes);
    let s = this.result;
    s.map && !t.changes.empty && (s = s.map(s, t.changes));
    let r = t.changes.mapPos(this.from), o = t.changes.mapPos(this.to, 1), l = me(t.state);
    if ((this.explicitPos < 0 ? l <= r : l < this.from) || l > o || !s || e & 2 && me(t.startState) == this.from)
      return new At(
        this.source,
        e & 4 ? 1 : 0
        /* State.Inactive */
      );
    let a = this.explicitPos < 0 ? -1 : t.changes.mapPos(this.explicitPos);
    return zg(s.validFor, t.state, r, o) ? new Ye(this.source, a, s, r, o) : s.update && (s = s.update(s, r, o, new vc(t.state, l, a >= 0))) ? new Ye(this.source, a, s, s.from, (i = s.to) !== null && i !== void 0 ? i : me(t.state)) : new At(this.source, 1, a);
  }
  map(t) {
    return t.empty ? this : (this.result.map ? this.result.map(this.result, t) : this.result) ? new Ye(this.source, this.explicitPos < 0 ? -1 : t.mapPos(this.explicitPos), this.result, t.mapPos(this.from), t.mapPos(this.to, 1)) : new At(
      this.source,
      0
      /* State.Inactive */
    );
  }
  touches(t) {
    return t.changes.touchesRange(this.from, this.to);
  }
}
function zg(n, t, e, i) {
  if (!n)
    return !1;
  let s = t.sliceDoc(e, i);
  return typeof n == "function" ? n(s, e, i, t) : kc(n, !0).test(s);
}
const eo = /* @__PURE__ */ R.define({
  map(n, t) {
    return n.map((e) => e.map(t));
  }
}), Ac = /* @__PURE__ */ R.define(), xt = /* @__PURE__ */ at.define({
  create() {
    return Gn.start();
  },
  update(n, t) {
    return n.update(t);
  },
  provide: (n) => [
    zr.from(n, (t) => t.tooltip),
    D.contentAttributes.from(n, (t) => t.attrs)
  ]
});
function io(n, t) {
  const e = t.completion.apply || t.completion.label;
  let i = n.state.field(xt).active.find((s) => s.source == t.source);
  return i instanceof Ye ? (typeof e == "string" ? n.dispatch(Object.assign(Object.assign({}, Dg(n.state, e, i.from, i.to)), { annotations: Sc.of(t.completion) })) : e(n, t.completion, i.from, i.to), !0) : !1;
}
const qg = /* @__PURE__ */ Eg(xt, io);
function dn(n, t = "option") {
  return (e) => {
    let i = e.state.field(xt, !1);
    if (!i || !i.open || i.open.disabled || Date.now() - i.open.timestamp < e.state.facet(et).interactionDelay)
      return !1;
    let s = 1, r;
    t == "page" && (r = uh(e, i.open.tooltip)) && (s = Math.max(2, Math.floor(r.dom.offsetHeight / r.dom.querySelector("li").offsetHeight) - 1));
    let { length: o } = i.open.options, l = i.open.selected > -1 ? i.open.selected + s * (n ? 1 : -1) : n ? 0 : o - 1;
    return l < 0 ? l = t == "page" ? 0 : o - 1 : l >= o && (l = t == "page" ? o - 1 : 0), e.dispatch({ effects: Ac.of(l) }), !0;
  };
}
const $g = (n) => {
  let t = n.state.field(xt, !1);
  return n.state.readOnly || !t || !t.open || t.open.selected < 0 || t.open.disabled || Date.now() - t.open.timestamp < n.state.facet(et).interactionDelay ? !1 : io(n, t.open.options[t.open.selected]);
}, Vl = (n) => n.state.field(xt, !1) ? (n.dispatch({ effects: Un.of(!0) }), !0) : !1, Kg = (n) => {
  let t = n.state.field(xt, !1);
  return !t || !t.active.some(
    (e) => e.state != 0
    /* State.Inactive */
  ) ? !1 : (n.dispatch({ effects: Ei.of(null) }), !0);
};
class jg {
  constructor(t, e) {
    this.active = t, this.context = e, this.time = Date.now(), this.updates = [], this.done = void 0;
  }
}
const Ug = 50, Gg = 1e3, Yg = /* @__PURE__ */ Q.fromClass(class {
  constructor(n) {
    this.view = n, this.debounceUpdate = -1, this.running = [], this.debounceAccept = -1, this.pendingStart = !1, this.composing = 0;
    for (let t of n.state.field(xt).active)
      t.state == 1 && this.startQuery(t);
  }
  update(n) {
    let t = n.state.field(xt), e = n.state.facet(et);
    if (!n.selectionSet && !n.docChanged && n.startState.field(xt) == t)
      return;
    let i = n.transactions.some((r) => {
      let o = Cc(r, e);
      return o & 8 || (r.selection || r.docChanged) && !(o & 3);
    });
    for (let r = 0; r < this.running.length; r++) {
      let o = this.running[r];
      if (i || o.context.abortOnDocChange && n.docChanged || o.updates.length + n.transactions.length > Ug && Date.now() - o.time > Gg) {
        for (let l of o.context.abortListeners)
          try {
            l();
          } catch (a) {
            wt(this.view.state, a);
          }
        o.context.abortListeners = null, this.running.splice(r--, 1);
      } else
        o.updates.push(...n.transactions);
    }
    this.debounceUpdate > -1 && clearTimeout(this.debounceUpdate), n.transactions.some((r) => r.effects.some((o) => o.is(Un))) && (this.pendingStart = !0);
    let s = this.pendingStart ? 50 : e.activateOnTypingDelay;
    if (this.debounceUpdate = t.active.some((r) => r.state == 1 && !this.running.some((o) => o.active.source == r.source)) ? setTimeout(() => this.startUpdate(), s) : -1, this.composing != 0)
      for (let r of n.transactions)
        r.isUserEvent("input.type") ? this.composing = 2 : this.composing == 2 && r.selection && (this.composing = 3);
  }
  startUpdate() {
    this.debounceUpdate = -1, this.pendingStart = !1;
    let { state: n } = this.view, t = n.field(xt);
    for (let e of t.active)
      e.state == 1 && !this.running.some((i) => i.active.source == e.source) && this.startQuery(e);
    this.running.length && t.open && t.open.disabled && (this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(et).updateSyncTime));
  }
  startQuery(n) {
    let { state: t } = this.view, e = me(t), i = new vc(t, e, n.explicitPos == e, this.view), s = new jg(n, i);
    this.running.push(s), Promise.resolve(n.source(i)).then((r) => {
      s.context.aborted || (s.done = r || null, this.scheduleAccept());
    }, (r) => {
      this.view.dispatch({ effects: Ei.of(null) }), wt(this.view.state, r);
    });
  }
  scheduleAccept() {
    this.running.every((n) => n.done !== void 0) ? this.accept() : this.debounceAccept < 0 && (this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(et).updateSyncTime));
  }
  // For each finished query in this.running, try to create a result
  // or, if appropriate, restart the query.
  accept() {
    var n;
    this.debounceAccept > -1 && clearTimeout(this.debounceAccept), this.debounceAccept = -1;
    let t = [], e = this.view.state.facet(et), i = this.view.state.field(xt);
    for (let s = 0; s < this.running.length; s++) {
      let r = this.running[s];
      if (r.done === void 0)
        continue;
      if (this.running.splice(s--, 1), r.done) {
        let l = new Ye(r.active.source, r.active.explicitPos, r.done, r.done.from, (n = r.done.to) !== null && n !== void 0 ? n : me(r.updates.length ? r.updates[0].startState : this.view.state));
        for (let a of r.updates)
          l = l.update(a, e);
        if (l.hasResult()) {
          t.push(l);
          continue;
        }
      }
      let o = i.active.find((l) => l.source == r.active.source);
      if (o && o.state == 1)
        if (r.done == null) {
          let l = new At(
            r.active.source,
            0
            /* State.Inactive */
          );
          for (let a of r.updates)
            l = l.update(a, e);
          l.state != 1 && t.push(l);
        } else
          this.startQuery(o);
    }
    (t.length || i.open && i.open.disabled) && this.view.dispatch({ effects: eo.of(t) });
  }
}, {
  eventHandlers: {
    blur(n) {
      let t = this.view.state.field(xt, !1);
      if (t && t.tooltip && this.view.state.facet(et).closeOnBlur) {
        let e = t.open && uh(this.view, t.open.tooltip);
        (!e || !e.dom.contains(n.relatedTarget)) && setTimeout(() => this.view.dispatch({ effects: Ei.of(null) }), 10);
      }
    },
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      this.composing == 3 && setTimeout(() => this.view.dispatch({ effects: Un.of(!1) }), 20), this.composing = 0;
    }
  }
}), _g = typeof navigator == "object" && /* @__PURE__ */ /Win/.test(navigator.platform), Jg = /* @__PURE__ */ Ne.highest(/* @__PURE__ */ D.domEventHandlers({
  keydown(n, t) {
    let e = t.state.field(xt, !1);
    if (!e || !e.open || e.open.disabled || e.open.selected < 0 || n.key.length > 1 || n.ctrlKey && !(_g && n.altKey) || n.metaKey)
      return !1;
    let i = e.open.options[e.open.selected], s = e.active.find((o) => o.source == i.source), r = i.completion.commitCharacters || s.result.commitCharacters;
    return r && r.indexOf(n.key) > -1 && io(t, i), !1;
  }
})), Xg = /* @__PURE__ */ D.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li, & > completion-section": {
        padding: "1px 3px",
        lineHeight: 1.2
      },
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
      },
      "& > completion-section": {
        display: "list-item",
        borderBottom: "1px solid silver",
        paddingLeft: "0.5em",
        opacity: 0.7
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"···"',
    opacity: 0.5,
    display: "block",
    textAlign: "center"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "400px",
    boxSizing: "border-box",
    whiteSpace: "pre-line"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: "30px" },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: "30px" },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'ƒ'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'○'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'◌'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'𝑥'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'𝐶'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'𝑡'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'∪'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'□'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'🔑︎'" }
    // Disable emoji rendering
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'▢'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
}), Ii = {
  brackets: ["(", "[", "{", "'", '"'],
  before: ")]}:;>",
  stringPrefixes: []
}, Te = /* @__PURE__ */ R.define({
  map(n, t) {
    let e = t.mapPos(n, -1, mt.TrackAfter);
    return e ?? void 0;
  }
}), no = /* @__PURE__ */ new class extends Le {
}();
no.startSide = 1;
no.endSide = -1;
const Mc = /* @__PURE__ */ at.define({
  create() {
    return H.empty;
  },
  update(n, t) {
    if (n = n.map(t.changes), t.selection) {
      let e = t.state.doc.lineAt(t.selection.main.head);
      n = n.update({ filter: (i) => i >= e.from && i <= e.to });
    }
    for (let e of t.effects)
      e.is(Te) && (n = n.update({ add: [no.range(e.value, e.value + 1)] }));
    return n;
  }
});
function Qg() {
  return [t0, Mc];
}
const Bs = "()[]{}<>";
function Dc(n) {
  for (let t = 0; t < Bs.length; t += 2)
    if (Bs.charCodeAt(t) == n)
      return Bs.charAt(t + 1);
  return Mr(n < 128 ? n : n + 1);
}
function Oc(n, t) {
  return n.languageDataAt("closeBrackets", t)[0] || Ii;
}
const Zg = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), t0 = /* @__PURE__ */ D.inputHandler.of((n, t, e, i) => {
  if ((Zg ? n.composing : n.compositionStarted) || n.state.readOnly)
    return !1;
  let s = n.state.selection.main;
  if (i.length > 2 || i.length == 2 && Bt(st(i, 0)) == 1 || t != s.from || e != s.to)
    return !1;
  let r = n0(n.state, i);
  return r ? (n.dispatch(r), !0) : !1;
}), e0 = ({ state: n, dispatch: t }) => {
  if (n.readOnly)
    return !1;
  let i = Oc(n, n.selection.main.head).brackets || Ii.brackets, s = null, r = n.changeByRange((o) => {
    if (o.empty) {
      let l = s0(n.doc, o.head);
      for (let a of i)
        if (a == l && os(n.doc, o.head) == Dc(st(a, 0)))
          return {
            changes: { from: o.head - a.length, to: o.head + a.length },
            range: x.cursor(o.head - a.length)
          };
    }
    return { range: s = o };
  });
  return s || t(n.update(r, { scrollIntoView: !0, userEvent: "delete.backward" })), !s;
}, i0 = [
  { key: "Backspace", run: e0 }
];
function n0(n, t) {
  let e = Oc(n, n.selection.main.head), i = e.brackets || Ii.brackets;
  for (let s of i) {
    let r = Dc(st(s, 0));
    if (t == s)
      return r == s ? l0(n, s, i.indexOf(s + s + s) > -1, e) : r0(n, s, r, e.before || Ii.before);
    if (t == r && Tc(n, n.selection.main.from))
      return o0(n, s, r);
  }
  return null;
}
function Tc(n, t) {
  let e = !1;
  return n.field(Mc).between(0, n.doc.length, (i) => {
    i == t && (e = !0);
  }), e;
}
function os(n, t) {
  let e = n.sliceString(t, t + 2);
  return e.slice(0, Bt(st(e, 0)));
}
function s0(n, t) {
  let e = n.sliceString(t - 2, t);
  return Bt(st(e, 0)) == e.length ? e : e.slice(1);
}
function r0(n, t, e, i) {
  let s = null, r = n.changeByRange((o) => {
    if (!o.empty)
      return {
        changes: [{ insert: t, from: o.from }, { insert: e, from: o.to }],
        effects: Te.of(o.to + t.length),
        range: x.range(o.anchor + t.length, o.head + t.length)
      };
    let l = os(n.doc, o.head);
    return !l || /\s/.test(l) || i.indexOf(l) > -1 ? {
      changes: { insert: t + e, from: o.head },
      effects: Te.of(o.head + t.length),
      range: x.cursor(o.head + t.length)
    } : { range: s = o };
  });
  return s ? null : n.update(r, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function o0(n, t, e) {
  let i = null, s = n.changeByRange((r) => r.empty && os(n.doc, r.head) == e ? {
    changes: { from: r.head, to: r.head + e.length, insert: e },
    range: x.cursor(r.head + e.length)
  } : i = { range: r });
  return i ? null : n.update(s, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function l0(n, t, e, i) {
  let s = i.stringPrefixes || Ii.stringPrefixes, r = null, o = n.changeByRange((l) => {
    if (!l.empty)
      return {
        changes: [{ insert: t, from: l.from }, { insert: t, from: l.to }],
        effects: Te.of(l.to + t.length),
        range: x.range(l.anchor + t.length, l.head + t.length)
      };
    let a = l.head, c = os(n.doc, a), h;
    if (c == t) {
      if (Wl(n, a))
        return {
          changes: { insert: t + t, from: a },
          effects: Te.of(a + t.length),
          range: x.cursor(a + t.length)
        };
      if (Tc(n, a)) {
        let u = e && n.sliceDoc(a, a + t.length * 3) == t + t + t ? t + t + t : t;
        return {
          changes: { from: a, to: a + u.length, insert: u },
          range: x.cursor(a + u.length)
        };
      }
    } else {
      if (e && n.sliceDoc(a - 2 * t.length, a) == t + t && (h = zl(n, a - 2 * t.length, s)) > -1 && Wl(n, h))
        return {
          changes: { insert: t + t + t + t, from: a },
          effects: Te.of(a + t.length),
          range: x.cursor(a + t.length)
        };
      if (n.charCategorizer(a)(c) != _.Word && zl(n, a, s) > -1 && !a0(n, a, t, s))
        return {
          changes: { insert: t + t, from: a },
          effects: Te.of(a + t.length),
          range: x.cursor(a + t.length)
        };
    }
    return { range: r = l };
  });
  return r ? null : n.update(o, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function Wl(n, t) {
  let e = ut(n).resolveInner(t + 1);
  return e.parent && e.from == t;
}
function a0(n, t, e, i) {
  let s = ut(n).resolveInner(t, -1), r = i.reduce((o, l) => Math.max(o, l.length), 0);
  for (let o = 0; o < 5; o++) {
    let l = n.sliceDoc(s.from, Math.min(s.to, s.from + e.length + r)), a = l.indexOf(e);
    if (!a || a > -1 && i.indexOf(l.slice(0, a)) > -1) {
      let h = s.firstChild;
      for (; h && h.from == s.from && h.to - h.from > e.length + a; ) {
        if (n.sliceDoc(h.to - e.length, h.to) == e)
          return !1;
        h = h.firstChild;
      }
      return !0;
    }
    let c = s.to == t && s.parent;
    if (!c)
      break;
    s = c;
  }
  return !1;
}
function zl(n, t, e) {
  let i = n.charCategorizer(t);
  if (i(n.sliceDoc(t - 1, t)) != _.Word)
    return t;
  for (let s of e) {
    let r = t - s.length;
    if (n.sliceDoc(r, t) == s && i(n.sliceDoc(r - 1, r)) != _.Word)
      return r;
  }
  return -1;
}
function h0(n = {}) {
  return [
    Jg,
    xt,
    et.of(n),
    Yg,
    c0,
    Xg
  ];
}
const Bc = [
  { key: "Ctrl-Space", run: Vl },
  { mac: "Alt-`", run: Vl },
  { key: "Escape", run: Kg },
  { key: "ArrowDown", run: /* @__PURE__ */ dn(!0) },
  { key: "ArrowUp", run: /* @__PURE__ */ dn(!1) },
  { key: "PageDown", run: /* @__PURE__ */ dn(!0, "page") },
  { key: "PageUp", run: /* @__PURE__ */ dn(!1, "page") },
  { key: "Enter", run: $g }
], c0 = /* @__PURE__ */ Ne.highest(/* @__PURE__ */ Vr.computeN([et], (n) => n.facet(et).defaultKeymap ? [Bc] : []));
class f0 {
  constructor(t, e, i) {
    this.from = t, this.to = e, this.diagnostic = i;
  }
}
class De {
  constructor(t, e, i) {
    this.diagnostics = t, this.panel = e, this.selected = i;
  }
  static init(t, e, i) {
    let s = t, r = i.facet(Ni).markerFilter;
    r && (s = r(s, i));
    let o = B.set(s.map((l) => l.from == l.to || l.from == l.to - 1 && i.doc.lineAt(l.from).to == l.from ? B.widget({
      widget: new w0(l),
      diagnostic: l
    }).range(l.from) : B.mark({
      attributes: { class: "cm-lintRange cm-lintRange-" + l.severity + (l.markClass ? " " + l.markClass : "") },
      diagnostic: l
    }).range(l.from, l.to)), !0);
    return new De(o, e, ei(o));
  }
}
function ei(n, t = null, e = 0) {
  let i = null;
  return n.between(e, 1e9, (s, r, { spec: o }) => {
    if (!(t && o.diagnostic != t))
      return i = new f0(s, r, o.diagnostic), !1;
  }), i;
}
function u0(n, t) {
  let e = t.pos, i = t.end || e, s = n.state.facet(Ni).hideOn(n, e, i);
  if (s != null)
    return s;
  let r = n.startState.doc.lineAt(t.pos);
  return !!(n.effects.some((o) => o.is(Lc)) || n.changes.touchesRange(r.from, Math.max(r.to, i)));
}
function d0(n, t) {
  return n.field(Mt, !1) ? t : t.concat(R.appendConfig.of(S0));
}
const Lc = /* @__PURE__ */ R.define(), so = /* @__PURE__ */ R.define(), Rc = /* @__PURE__ */ R.define(), Mt = /* @__PURE__ */ at.define({
  create() {
    return new De(B.none, null, null);
  },
  update(n, t) {
    if (t.docChanged && n.diagnostics.size) {
      let e = n.diagnostics.map(t.changes), i = null, s = n.panel;
      if (n.selected) {
        let r = t.changes.mapPos(n.selected.from, 1);
        i = ei(e, n.selected.diagnostic, r) || ei(e, null, r);
      }
      !e.size && s && t.state.facet(Ni).autoPanel && (s = null), n = new De(e, s, i);
    }
    for (let e of t.effects)
      if (e.is(Lc)) {
        let i = t.state.facet(Ni).autoPanel ? e.value.length ? Fi.open : null : n.panel;
        n = De.init(e.value, i, t.state);
      } else e.is(so) ? n = new De(n.diagnostics, e.value ? Fi.open : null, n.selected) : e.is(Rc) && (n = new De(n.diagnostics, n.panel, e.value));
    return n;
  },
  provide: (n) => [
    Bi.from(n, (t) => t.panel),
    D.decorations.from(n, (t) => t.diagnostics)
  ]
}), p0 = /* @__PURE__ */ B.mark({ class: "cm-lintRange cm-lintRange-active" });
function m0(n, t, e) {
  let { diagnostics: i } = n.state.field(Mt), s = [], r = 2e8, o = 0;
  i.between(t - (e < 0 ? 1 : 0), t + (e > 0 ? 1 : 0), (a, c, { spec: h }) => {
    t >= a && t <= c && (a == c || (t > a || e > 0) && (t < c || e < 0)) && (s.push(h.diagnostic), r = Math.min(a, r), o = Math.max(c, o));
  });
  let l = n.state.facet(Ni).tooltipFilter;
  return l && (s = l(s, n.state)), s.length ? {
    pos: r,
    end: o,
    above: n.state.doc.lineAt(r).to < o,
    create() {
      return { dom: g0(n, s) };
    }
  } : null;
}
function g0(n, t) {
  return U("ul", { class: "cm-tooltip-lint" }, t.map((e) => Ec(n, e, !1)));
}
const y0 = (n) => {
  let t = n.state.field(Mt, !1);
  (!t || !t.panel) && n.dispatch({ effects: d0(n.state, [so.of(!0)]) });
  let e = Ti(n, Fi.open);
  return e && e.dom.querySelector(".cm-panel-lint ul").focus(), !0;
}, ql = (n) => {
  let t = n.state.field(Mt, !1);
  return !t || !t.panel ? !1 : (n.dispatch({ effects: so.of(!1) }), !0);
}, b0 = (n) => {
  let t = n.state.field(Mt, !1);
  if (!t)
    return !1;
  let e = n.state.selection.main, i = t.diagnostics.iter(e.to + 1);
  return !i.value && (i = t.diagnostics.iter(0), !i.value || i.from == e.from && i.to == e.to) ? !1 : (n.dispatch({ selection: { anchor: i.from, head: i.to }, scrollIntoView: !0 }), !0);
}, x0 = [
  { key: "Mod-Shift-m", run: y0, preventDefault: !0 },
  { key: "F8", run: b0 }
], Ni = /* @__PURE__ */ O.define({
  combine(n) {
    return Object.assign({ sources: n.map((t) => t.source).filter((t) => t != null) }, Zt(n.map((t) => t.config), {
      delay: 750,
      markerFilter: null,
      tooltipFilter: null,
      needsRefresh: null,
      hideOn: () => null
    }, {
      needsRefresh: (t, e) => t ? e ? (i) => t(i) || e(i) : t : e
    }));
  }
});
function Pc(n) {
  let t = [];
  if (n)
    t: for (let { name: e } of n) {
      for (let i = 0; i < e.length; i++) {
        let s = e[i];
        if (/[a-zA-Z]/.test(s) && !t.some((r) => r.toLowerCase() == s.toLowerCase())) {
          t.push(s);
          continue t;
        }
      }
      t.push("");
    }
  return t;
}
function Ec(n, t, e) {
  var i;
  let s = e ? Pc(t.actions) : [];
  return U("li", { class: "cm-diagnostic cm-diagnostic-" + t.severity }, U("span", { class: "cm-diagnosticText" }, t.renderMessage ? t.renderMessage(n) : t.message), (i = t.actions) === null || i === void 0 ? void 0 : i.map((r, o) => {
    let l = !1, a = (u) => {
      if (u.preventDefault(), l)
        return;
      l = !0;
      let d = ei(n.state.field(Mt).diagnostics, t);
      d && r.apply(n, d.from, d.to);
    }, { name: c } = r, h = s[o] ? c.indexOf(s[o]) : -1, f = h < 0 ? c : [
      c.slice(0, h),
      U("u", c.slice(h, h + 1)),
      c.slice(h + 1)
    ];
    return U("button", {
      type: "button",
      class: "cm-diagnosticAction",
      onclick: a,
      onmousedown: a,
      "aria-label": ` Action: ${c}${h < 0 ? "" : ` (access key "${s[o]})"`}.`
    }, f);
  }), t.source && U("div", { class: "cm-diagnosticSource" }, t.source));
}
class w0 extends ke {
  constructor(t) {
    super(), this.diagnostic = t;
  }
  eq(t) {
    return t.diagnostic == this.diagnostic;
  }
  toDOM() {
    return U("span", { class: "cm-lintPoint cm-lintPoint-" + this.diagnostic.severity });
  }
}
class $l {
  constructor(t, e) {
    this.diagnostic = e, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = Ec(t, e, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class Fi {
  constructor(t) {
    this.view = t, this.items = [];
    let e = (s) => {
      if (s.keyCode == 27)
        ql(this.view), this.view.focus();
      else if (s.keyCode == 38 || s.keyCode == 33)
        this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
      else if (s.keyCode == 40 || s.keyCode == 34)
        this.moveSelection((this.selectedIndex + 1) % this.items.length);
      else if (s.keyCode == 36)
        this.moveSelection(0);
      else if (s.keyCode == 35)
        this.moveSelection(this.items.length - 1);
      else if (s.keyCode == 13)
        this.view.focus();
      else if (s.keyCode >= 65 && s.keyCode <= 90 && this.selectedIndex >= 0) {
        let { diagnostic: r } = this.items[this.selectedIndex], o = Pc(r.actions);
        for (let l = 0; l < o.length; l++)
          if (o[l].toUpperCase().charCodeAt(0) == s.keyCode) {
            let a = ei(this.view.state.field(Mt).diagnostics, r);
            a && r.actions[l].apply(t, a.from, a.to);
          }
      } else
        return;
      s.preventDefault();
    }, i = (s) => {
      for (let r = 0; r < this.items.length; r++)
        this.items[r].dom.contains(s.target) && this.moveSelection(r);
    };
    this.list = U("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown: e,
      onclick: i
    }), this.dom = U("div", { class: "cm-panel-lint" }, this.list, U("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => ql(this.view)
    }, "×")), this.update();
  }
  get selectedIndex() {
    let t = this.view.state.field(Mt).selected;
    if (!t)
      return -1;
    for (let e = 0; e < this.items.length; e++)
      if (this.items[e].diagnostic == t.diagnostic)
        return e;
    return -1;
  }
  update() {
    let { diagnostics: t, selected: e } = this.view.state.field(Mt), i = 0, s = !1, r = null;
    for (t.between(0, this.view.state.doc.length, (o, l, { spec: a }) => {
      let c = -1, h;
      for (let f = i; f < this.items.length; f++)
        if (this.items[f].diagnostic == a.diagnostic) {
          c = f;
          break;
        }
      c < 0 ? (h = new $l(this.view, a.diagnostic), this.items.splice(i, 0, h), s = !0) : (h = this.items[c], c > i && (this.items.splice(i, c - i), s = !0)), e && h.diagnostic == e.diagnostic ? h.dom.hasAttribute("aria-selected") || (h.dom.setAttribute("aria-selected", "true"), r = h) : h.dom.hasAttribute("aria-selected") && h.dom.removeAttribute("aria-selected"), i++;
    }); i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      s = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new $l(this.view, {
      from: -1,
      to: -1,
      severity: "info",
      message: this.view.state.phrase("No diagnostics")
    })), s = !0), r ? (this.list.setAttribute("aria-activedescendant", r.id), this.view.requestMeasure({
      key: this,
      read: () => ({ sel: r.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect() }),
      write: ({ sel: o, panel: l }) => {
        let a = l.height / this.list.offsetHeight;
        o.top < l.top ? this.list.scrollTop -= (l.top - o.top) / a : o.bottom > l.bottom && (this.list.scrollTop += (o.bottom - l.bottom) / a);
      }
    })) : this.selectedIndex < 0 && this.list.removeAttribute("aria-activedescendant"), s && this.sync();
  }
  sync() {
    let t = this.list.firstChild;
    function e() {
      let i = t;
      t = i.nextSibling, i.remove();
    }
    for (let i of this.items)
      if (i.dom.parentNode == this.list) {
        for (; t != i.dom; )
          e();
        t = i.dom.nextSibling;
      } else
        this.list.insertBefore(i.dom, t);
    for (; t; )
      e();
  }
  moveSelection(t) {
    if (this.selectedIndex < 0)
      return;
    let e = this.view.state.field(Mt), i = ei(e.diagnostics, this.items[t].diagnostic);
    i && this.view.dispatch({
      selection: { anchor: i.from, head: i.to },
      scrollIntoView: !0,
      effects: Rc.of(i)
    });
  }
  static open(t) {
    return new Fi(t);
  }
}
function v0(n, t = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${t}>${encodeURIComponent(n)}</svg>')`;
}
function pn(n) {
  return v0(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${n}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const k0 = /* @__PURE__ */ D.baseTheme({
  ".cm-diagnostic": {
    padding: "3px 6px 3px 8px",
    marginLeft: "-1px",
    display: "block",
    whiteSpace: "pre-wrap"
  },
  ".cm-diagnostic-error": { borderLeft: "5px solid #d11" },
  ".cm-diagnostic-warning": { borderLeft: "5px solid orange" },
  ".cm-diagnostic-info": { borderLeft: "5px solid #999" },
  ".cm-diagnostic-hint": { borderLeft: "5px solid #66d" },
  ".cm-diagnosticAction": {
    font: "inherit",
    border: "none",
    padding: "2px 4px",
    backgroundColor: "#444",
    color: "white",
    borderRadius: "3px",
    marginLeft: "8px",
    cursor: "pointer"
  },
  ".cm-diagnosticSource": {
    fontSize: "70%",
    opacity: 0.7
  },
  ".cm-lintRange": {
    backgroundPosition: "left bottom",
    backgroundRepeat: "repeat-x",
    paddingBottom: "0.7px"
  },
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ pn("#d11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ pn("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ pn("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ pn("#66d") },
  ".cm-lintRange-active": { backgroundColor: "#ffdd9980" },
  ".cm-tooltip-lint": {
    padding: 0,
    margin: 0
  },
  ".cm-lintPoint": {
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "-2px",
      borderLeft: "3px solid transparent",
      borderRight: "3px solid transparent",
      borderBottom: "4px solid #d11"
    }
  },
  ".cm-lintPoint-warning": {
    "&:after": { borderBottomColor: "orange" }
  },
  ".cm-lintPoint-info": {
    "&:after": { borderBottomColor: "#999" }
  },
  ".cm-lintPoint-hint": {
    "&:after": { borderBottomColor: "#66d" }
  },
  ".cm-panel.cm-panel-lint": {
    position: "relative",
    "& ul": {
      maxHeight: "100px",
      overflowY: "auto",
      "& [aria-selected]": {
        backgroundColor: "#ddd",
        "& u": { textDecoration: "underline" }
      },
      "&:focus [aria-selected]": {
        background_fallback: "#bdf",
        backgroundColor: "Highlight",
        color_fallback: "white",
        color: "HighlightText"
      },
      "& u": { textDecoration: "none" },
      padding: 0,
      margin: 0
    },
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "2px",
      background: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    }
  }
}), S0 = [
  Mt,
  /* @__PURE__ */ D.decorations.compute([Mt], (n) => {
    let { selected: t, panel: e } = n.field(Mt);
    return !t || !e || t.from == t.to ? B.none : B.set([
      p0.range(t.from, t.to)
    ]);
  }),
  /* @__PURE__ */ md(m0, { hideOn: u0 }),
  k0
], C0 = [
  Md(),
  Td(),
  Uu(),
  Yp(),
  vp(),
  Iu(),
  Wu(),
  F.allowMultipleSelections.of(!0),
  lp(),
  Lh(Ap, { fallback: !0 }),
  Rp(),
  Qg(),
  h0(),
  sd(),
  ld(),
  Qu(),
  ig(),
  Vr.of([
    ...i0,
    ...Jm,
    ...vg,
    ...nm,
    ...yp,
    ...Bc,
    ...x0
  ])
];
function Yn() {
  return Yn = Object.assign ? Object.assign.bind() : function(n) {
    for (var t = 1; t < arguments.length; t++) {
      var e = arguments[t];
      for (var i in e) ({}).hasOwnProperty.call(e, i) && (n[i] = e[i]);
    }
    return n;
  }, Yn.apply(null, arguments);
}
var Ic = (n) => {
  var {
    theme: t,
    settings: e = {},
    styles: i = []
  } = n, s = {
    ".cm-gutters": {}
  }, r = {};
  e.background && (r.backgroundColor = e.background), e.backgroundImage && (r.backgroundImage = e.backgroundImage), e.foreground && (r.color = e.foreground), e.fontSize && (r.fontSize = e.fontSize), (e.background || e.foreground) && (s["&"] = r), e.fontFamily && (s["&.cm-editor .cm-scroller"] = {
    fontFamily: e.fontFamily
  }), e.gutterBackground && (s[".cm-gutters"].backgroundColor = e.gutterBackground), e.gutterForeground && (s[".cm-gutters"].color = e.gutterForeground), e.gutterBorder && (s[".cm-gutters"].borderRightColor = e.gutterBorder), e.caret && (s[".cm-content"] = {
    caretColor: e.caret
  }, s[".cm-cursor, .cm-dropCursor"] = {
    borderLeftColor: e.caret
  });
  var o = {};
  e.gutterActiveForeground && (o.color = e.gutterActiveForeground), e.lineHighlight && (s[".cm-activeLine"] = {
    backgroundColor: e.lineHighlight
  }, o.backgroundColor = e.lineHighlight), s[".cm-activeLineGutter"] = o, e.selection && (s["&.cm-focused .cm-selectionBackground, & .cm-line::selection, & .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection"] = {
    background: e.selection + " !important"
  }), e.selectionMatch && (s["& .cm-selectionMatch"] = {
    backgroundColor: e.selectionMatch
  });
  var l = D.theme(s, {
    dark: t === "dark"
  }), a = qi.define(i), c = [l, Lh(a)];
  return c;
}, A0 = {
  background: "#ffffff",
  foreground: "#383a42",
  caret: "#000",
  selection: "#add6ff",
  selectionMatch: "#a8ac94",
  lineHighlight: "#99999926",
  gutterBackground: "#fff",
  gutterForeground: "#237893",
  gutterActiveForeground: "#0b216f",
  fontFamily: 'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace'
}, M0 = [{
  tag: [m.keyword, m.operatorKeyword, m.modifier, m.color, m.constant(m.name), m.standard(m.name), m.standard(m.tagName), m.special(m.brace), m.atom, m.bool, m.special(m.variableName)],
  color: "#0000ff"
}, {
  tag: [m.moduleKeyword, m.controlKeyword],
  color: "#af00db"
}, {
  tag: [m.name, m.deleted, m.character, m.macroName, m.propertyName, m.variableName, m.labelName, m.definition(m.name)],
  color: "#0070c1"
}, {
  tag: m.heading,
  fontWeight: "bold",
  color: "#0070c1"
}, {
  tag: [m.typeName, m.className, m.tagName, m.number, m.changed, m.annotation, m.self, m.namespace],
  color: "#267f99"
}, {
  tag: [m.function(m.variableName), m.function(m.propertyName)],
  color: "#795e26"
}, {
  tag: [m.number],
  color: "#098658"
}, {
  tag: [m.operator, m.punctuation, m.separator, m.url, m.escape, m.regexp],
  color: "#383a42"
}, {
  tag: [m.regexp],
  color: "#af00db"
}, {
  tag: [m.special(m.string), m.processingInstruction, m.string, m.inserted],
  color: "#a31515"
}, {
  tag: [m.angleBracket],
  color: "#383a42"
}, {
  tag: m.strong,
  fontWeight: "bold"
}, {
  tag: m.emphasis,
  fontStyle: "italic"
}, {
  tag: m.strikethrough,
  textDecoration: "line-through"
}, {
  tag: [m.meta, m.comment],
  color: "#008000"
}, {
  tag: m.link,
  color: "#4078f2",
  textDecoration: "underline"
}, {
  tag: m.invalid,
  color: "#e45649"
}];
function D0(n) {
  var {
    theme: t = "light",
    settings: e = {},
    styles: i = []
  } = {};
  return Ic({
    theme: t,
    settings: Yn({}, A0, e),
    styles: [...M0, ...i]
  });
}
D0();
var O0 = {
  background: "#1e1e1e",
  foreground: "#9cdcfe",
  caret: "#c6c6c6",
  selection: "#6199ff2f",
  selectionMatch: "#72a1ff59",
  lineHighlight: "#ffffff0f",
  gutterBackground: "#1e1e1e",
  gutterForeground: "#838383",
  gutterActiveForeground: "#fff",
  fontFamily: 'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace'
}, T0 = [{
  tag: [m.keyword, m.operatorKeyword, m.modifier, m.color, m.constant(m.name), m.standard(m.name), m.standard(m.tagName), m.special(m.brace), m.atom, m.bool, m.special(m.variableName)],
  color: "#569cd6"
}, {
  tag: [m.controlKeyword, m.moduleKeyword],
  color: "#c586c0"
}, {
  tag: [m.name, m.deleted, m.character, m.macroName, m.propertyName, m.variableName, m.labelName, m.definition(m.name)],
  color: "#9cdcfe"
}, {
  tag: m.heading,
  fontWeight: "bold",
  color: "#9cdcfe"
}, {
  tag: [m.typeName, m.className, m.tagName, m.number, m.changed, m.annotation, m.self, m.namespace],
  color: "#4ec9b0"
}, {
  tag: [m.function(m.variableName), m.function(m.propertyName)],
  color: "#dcdcaa"
}, {
  tag: [m.number],
  color: "#b5cea8"
}, {
  tag: [m.operator, m.punctuation, m.separator, m.url, m.escape, m.regexp],
  color: "#d4d4d4"
}, {
  tag: [m.regexp],
  color: "#d16969"
}, {
  tag: [m.special(m.string), m.processingInstruction, m.string, m.inserted],
  color: "#ce9178"
}, {
  tag: [m.angleBracket],
  color: "#808080"
}, {
  tag: m.strong,
  fontWeight: "bold"
}, {
  tag: m.emphasis,
  fontStyle: "italic"
}, {
  tag: m.strikethrough,
  textDecoration: "line-through"
}, {
  tag: [m.meta, m.comment],
  color: "#6a9955"
}, {
  tag: m.link,
  color: "#6a9955",
  textDecoration: "underline"
}, {
  tag: m.invalid,
  color: "#ff0000"
}];
function B0(n) {
  var {
    theme: t = "dark",
    settings: e = {},
    styles: i = []
  } = {};
  return Ic({
    theme: t,
    settings: Yn({}, O0, e),
    styles: [...T0, ...i]
  });
}
var L0 = B0();
new D({
  parent: document.body,
  state: F.create({
    doc: "hi",
    extensions: [L0, C0]
  })
});
