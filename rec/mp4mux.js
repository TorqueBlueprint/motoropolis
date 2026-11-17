// Tiny MP4 writer for one H.264 video track from WebCodecs (no B-frames).
// usage: const m = new MP4Mux(w, h, fps); encoder output -> m.add(chunk, meta); const blob = m.finish();
(function () {
  function MP4Mux(w, h, fps) { this.w = w; this.h = h; this.fps = fps; this.samples = []; this.sizes = []; this.keys = []; this.avcC = null; }
  MP4Mux.prototype.add = function (chunk, meta) {
    if (meta && meta.decoderConfig && meta.decoderConfig.description && !this.avcC) {
      const d = meta.decoderConfig.description; this.avcC = new Uint8Array(d.buffer ? d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength) : d.slice(0));
    }
    const b = new Uint8Array(chunk.byteLength); chunk.copyTo(b); this.samples.push(b); this.sizes.push(b.length);
    if (chunk.type === 'key') this.keys.push(this.samples.length);
  };
  const u32 = v => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255], u16 = v => [(v >> 8) & 255, v & 255];
  const str = s => [...s].map(c => c.charCodeAt(0));
  function box(type, ...parts) { let n = 8; const flat = []; for (const p of parts) { const a = p instanceof Uint8Array ? p : Uint8Array.from(p); flat.push(a); n += a.length }
    const o = new Uint8Array(n); o.set(u32(n), 0); o.set(str(type), 4); let k = 8; for (const a of flat) { o.set(a, k); k += a.length } return o; }
  const full = (type, ver, flags, ...parts) => box(type, [ver, (flags >> 16) & 255, (flags >> 8) & 255, flags & 255], ...parts);
  const MATRIX = [...u32(0x10000), ...u32(0), ...u32(0), ...u32(0), ...u32(0x10000), ...u32(0), ...u32(0), ...u32(0), ...u32(0x40000000)];
  MP4Mux.prototype.finish = function () {
    if (!this.avcC) throw new Error('no avcC from encoder');
    const N = this.samples.length, TS = this.fps * 1000, DUR = N * 1000, msDur = Math.round(N * 1000 / this.fps);
    const ftyp = box('ftyp', str('isom'), u32(512), str('isomiso2avc1mp41'));
    let dataLen = 0; for (const s of this.sizes) dataLen += s;
    const mdatHead = new Uint8Array(8); mdatHead.set(u32(8 + dataLen), 0); mdatHead.set(str('mdat'), 4);
    let off = ftyp.length + 8; const stco = []; for (const s of this.sizes) { stco.push(...u32(off)); off += s }
    const W = this.w, H = this.h;
    const avc1 = box('avc1', [0, 0, 0, 0, 0, 0], u16(1), new Array(16).fill(0), u16(W), u16(H), u32(0x00480000), u32(0x00480000), u32(0), u16(1), new Array(32).fill(0), u16(0x18), u16(0xffff), box('avcC', this.avcC));
    const stbl = box('stbl', full('stsd', 0, 0, u32(1), avc1), full('stts', 0, 0, u32(1), u32(N), u32(1000)),
      full('stss', 0, 0, u32(this.keys.length), this.keys.flatMap(k => u32(k))),
      full('stsc', 0, 0, u32(1), u32(1), u32(1), u32(1)),
      full('stsz', 0, 0, u32(0), u32(N), this.sizes.flatMap(s => u32(s))),
      full('stco', 0, 0, u32(N), stco));
    const minf = box('minf', full('vmhd', 0, 1, u16(0), u16(0), u16(0), u16(0)), box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))), stbl);
    const mdia = box('mdia', full('mdhd', 0, 0, u32(0), u32(0), u32(TS), u32(DUR), u16(0x55c4), u16(0)),
      full('hdlr', 0, 0, u32(0), str('vide'), u32(0), u32(0), u32(0), str('VideoHandler'), [0]), minf);
    const trak = box('trak', full('tkhd', 0, 3, u32(0), u32(0), u32(1), u32(0), u32(msDur), u32(0), u32(0), u16(0), u16(0), u16(0), u16(0), MATRIX, u32(W << 16), u32(H << 16)), mdia);
    const moov = box('moov', full('mvhd', 0, 0, u32(0), u32(0), u32(1000), u32(msDur), u32(0x10000), u16(0x100), u16(0), u32(0), u32(0), MATRIX, new Array(24).fill(0), u32(2)), trak);
    return new Blob([ftyp, mdatHead, ...this.samples, moov], { type: 'video/mp4' });
  };
  window.MP4Mux = MP4Mux;
})();
