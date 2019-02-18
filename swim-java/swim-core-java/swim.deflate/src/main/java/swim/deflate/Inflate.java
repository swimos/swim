// Based on zlib-1.2.8
// Copyright (c) 1995-2013 Jean-loup Gailly and Mark Adler
// Copyright (c) 2016-2018 Swim.it inc.
//
// This software is provided 'as-is', without any express or implied
// warranty.  In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//    claim that you wrote the original software. If you use this software
//    in a product, an acknowledgment in the product documentation would be
//    appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//    misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

package swim.deflate;

import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import static swim.deflate.Adler32.adler32;
import static swim.deflate.CRC32.crc32;

@SuppressWarnings("checkstyle:all")
public class Inflate<O> extends Decoder<O> implements Cloneable {
  // inflated output sink
  public Decoder<O> output;

  // true if input will stop producing
  public boolean is_last;

  // flush mode for feed operations
  public int flush;

  // input buffer
  public byte[] next_in;

  // next input byte
  public int next_in_index;

  // number of bytes available at next_in_index
  public int avail_in;

  // total number of input bytes read so far
  public long total_in;

  // output buffer
  public byte[] next_out;

  // next output byte should be put there
  public int next_out_index;

  // remaining free space at next_out_index
  public int avail_out;

  // total number of bytes output so far
  public long total_out;

  // best guess about the data type: binary or text
  int data_type;

  // adler32 value of the uncompressed data
  int adler;

  // current inflate mode
  int mode;

  // true if processing last block
  boolean last;

  // bit 0 true for zlib, bit 1 true for gzip
  int wrap;

  // true if dictionary provided
  boolean havedict;

  // gzip header method and flags (0 if zlib)
  int flags;

  // zlib header max distance (INFLATE_STRICT)
  int dmax;

  // protected copy of check value
  int check;

  // protected copy of output count
  long total;

  // where to save gzip header information
  GzHeader head;

  // log base 2 of requested window size
  int wbits;

  // window size or zero if not using window
  int wsize;

  // valid bytes in the window
  public int whave;

  // window write index
  public int wnext;

  // allocated sliding window, if needed
  public byte[] window;

  // Output reads directly from sliding window through this buffer.
  public InputBuffer window_buffer;

  // input bit accumulator
  int hold;

  // number of bits in "in"
  int bits;

  // literal or length of data to copy
  int length;

  // distance back to copy string from
  int offset;

  // extra bits needed
  int extra;

  // starting table for length/literal codes
  int lencode;

  // starting table for distance codes
  int distcode;

  // index bits for lencode
  int lenbits;

  // index bits for distcode
  int distbits;

  // number of code length code lengths
  int ncode;

  // number of length code lengths
  int nlen;

  // number of distance code lengths
  int ndist;

  // number of code lengths in lens[]
  int have;

  // next available space in codes[]
  int next;

  // temporary storage for code lengths
  short lens[] = new short[320];

  // work area for code table building
  short work[] = new short[288];

  // space for code tables
  int codes[] = new int[ENOUGH];

  // if false, allow invalid distance too far
  boolean sane;

  // bits back of last unprocessed length/lit
  int back;

  // initial length of match
  int was;

  public Inflate(Decoder<O> output, int wrap, int windowBits) {
    this.output = output;
    inflateInit(wrap, windowBits);
  }

  public Inflate(Decoder<O> output, int wrap) {
    this(output, wrap, DEF_WBITS);
  }

  public Inflate(Decoder<O> output) {
    this(output, Z_NO_WRAP, DEF_WBITS);
  }

  public Inflate(int wrap, int windowBits) {
    this(null, wrap, windowBits);
  }

  public Inflate(int wrap) {
    this(null, wrap, DEF_WBITS);
  }

  public Inflate() {
    this(null, Z_NO_WRAP, DEF_WBITS);
  }

  Inflate(Inflate<O> from) {
    output = from.output;
    is_last = from.is_last;
    flush = from.flush;
    next_in = from.next_in;
    next_in_index = from.next_in_index;
    avail_in = from.avail_in;
    total_in = from.total_in;
    next_out = from.next_out;
    next_out_index = from.next_out_index;
    avail_out = from.avail_out;
    total_out = from.total_out;
    data_type = from.data_type;
    adler = from.adler;
    mode = from.mode;
    last = from.last;
    wrap = from.wrap;
    havedict = from.havedict;
    flags = from.flags;
    dmax = from.dmax;
    check = from.check;
    total = from.total;
    if (head != null) {
      head = from.head.clone();
    }
    wbits = from.wbits;
    wsize = from.wsize;
    whave = from.whave;
    wnext = from.wnext;
    if (from.window != null) {
      window = new byte[from.window.length];
      System.arraycopy(from.window, 0, window, 0, window.length);
      window_buffer = Binary.inputBuffer(window);
    }
    hold = from.hold;
    bits = from.bits;
    length = from.length;
    offset = from.offset;
    extra = from.extra;
    lencode = from.lencode;
    distcode = from.distcode;
    lenbits = from.lenbits;
    distbits = from.distbits;
    ncode = from.ncode;
    nlen = from.nlen;
    ndist = from.ndist;
    have = from.have;
    next = from.next;
    System.arraycopy(from.lens, 0, lens, 0, lens.length);
    System.arraycopy(from.work, 0, work, 0, work.length);
    System.arraycopy(from.codes, 0, codes, 0, codes.length);
    sane = from.sane;
    back = from.back;
    was = from.was;
  }

  public void inflateResetKeep() {
    total_in = total_out = total = 0;
    flush = Z_FINISH;
    mode = HEAD;
    last = false;
    havedict = false;
    dmax = 32768;
    head = null;
    hold = 0;
    bits = 0;
    lencode = distcode = next = 0;
    sane = true;
    back = -1;
  }

  public void inflateReset() {
    wsize = 0;
    whave = 0;
    wnext = 0;
    inflateResetKeep();
  }

  public void inflateReset(int wrap, int windowBits) {
    // set number of window bits, free window if different
    if (windowBits != 0 && (windowBits < 8 || windowBits > 15)) {
      throw new DeflateException(Z_STREAM_ERROR);
    }
    if (window != null && wbits != windowBits) {
      window = null;
      window_buffer = null;
    }

    // update state and reset the rest of it
    this.wrap = wrap;
    wbits = windowBits;
    inflateReset();
  }

  protected void inflateInit(int wrap, int windowBits) {
    window = null;
    window_buffer = null;
    inflateReset(wrap, windowBits);
  }

  public void initWindow() {
    if (window == null) {
      wsize = 1 << wbits;
      window = new byte[wsize * 2];
      window_buffer = Binary.inputBuffer(window);
      wnext = 0;
      whave = 0;
    }
  }

  @Override
  public Inflate<O> clone() {
    return new Inflate<O>(this);
  }

  // Set the current flush mode.
  public Inflate<O> flush(int flush) {
    this.flush = flush;
    return this;
  }

  @Override
  public Decoder<O> feed(InputBuffer input) {
    is_last = !input.isPart();
    next_in = input.array();
    next_in_index = input.arrayOffset() + input.index();
    avail_in = input.remaining();

    initWindow();
    next_out = window;

    try {
      boolean needsMore;
      do {
        next_out_index = wnext;
        avail_out = window.length - wnext;
        needsMore = inflate(flush);
      } while (needsMore && avail_in > 0 && output.isCont());

      if (output.isDone()) {
        return output;
      } else if (output.isError()) {
        return output.asError();
      } else if (!needsMore) {
        return done();
      } else if (input.isDone()) {
        return error(new DecoderException("truncated"));
      } else if (input.isError()) {
        return error(input.trap());
      } else {
        return this;
      }
    } catch (DeflateException cause) {
      return error(cause);
    } finally {
      input.index(next_in_index - input.arrayOffset());

      next_out = null;
      next_out_index = 0;
      avail_out = 0;

      next_in = null;
      next_in_index = 0;
      avail_in = 0;
    }
  }

  @SuppressWarnings("fallthrough")
  public boolean inflate(int flush) {
    int in, out; // save starting available input and output
    int copy; // number of stored or match bytes to copy
    int from; // where to copy match bytes from
    int here; // current decoding table entry
    int hereOp;
    int hereBits;
    int hereVal;
    int last; // parent table entry
    int lastOp;
    int lastBits;
    int lastVal;
    int len; // length to copy for repeats, bits to drop
    int ret; // return code
    String msg = null;
    byte[] hbuf = wrap == 2 ? new byte[4] : null; // buffer for gzip header crc calculation

    if (next_out == null || next_in == null && avail_in != 0) {
      throw new DeflateException(Z_STREAM_ERROR);
    }

    if (mode == TYPE) {
      mode = TYPEDO; // skip check
    }
    in = avail_in;
    out = avail_out;
    ret = Z_OK;
    inf_leave: while (true) {
      switch (mode) {
      case HEAD:
        if (wrap == 0) {
          mode = TYPEDO;
          break;
        }
        if (!NEEDBITS(16)) {
          break inf_leave;
        }
        if ((wrap & 2) != 0 && hold == 0x8B1F) { // gzip header
          check = crc32(0, null, 0, 0);
          CRC2(check, hbuf, hold);
          INITBITS();
          mode = FLAGS;
          break;
        }
        flags = 0; // expect zlib header
        if (head != null) {
          head.done = false;
        }
        if ((wrap & 1) == 0 || // check if zlib header allowed
          ((BITS(8) << 8) + (hold >>> 8)) % 31 != 0) {
          throw new DeflateException("incorrect header check");
          //msg = "incorrect header check";
          //mode = BAD;
          //break;
        }
        if (BITS(4) != Z_DEFLATED) {
          throw new DeflateException("unknown compression method");
          //msg = "unknown compression method";
          //mode = BAD;
          //break;
        }
        DROPBITS(4);
        len = BITS(4) + 8;
        if (wbits == 0) {
          wbits = len;
        } else if (len > wbits) {
          throw new DeflateException("invalid window size");
          //msg = "invalid window size";
          //mode = BAD;
          //break;
        }
        dmax = 1 << len;
        adler = check = adler32(0, null, 0, 0);
        mode = (hold & 0x200) != 0 ? DICTID : TYPE;
        INITBITS();
        break;
      case FLAGS:
        if (!NEEDBITS(16)) {
          break inf_leave;
        }
        flags = hold;
        if ((flags & 0xFF) != Z_DEFLATED) {
          throw new DeflateException("unknown compression method");
          //msg = "unknown compression method";
          //mode = BAD;
          //break;
        }
        if ((flags & 0xE000) != 0) {
          throw new DeflateException("unknown header flags set");
          //msg = "unknown header flags set";
          //mode = BAD;
          //break;
        }
        if (head != null) {
          head.text = ((hold >>> 8) & 1) != 0;
        }
        if ((flags & 0x0200) != 0) {
          CRC2(check, hbuf, hold);
        }
        INITBITS();
        mode = TIME;
      case TIME:
        if (!NEEDBITS(32)) {
          break inf_leave;
        }
        if (head != null) {
          head.time = hold;
        }
        if ((flags & 0x0200) != 0) {
          CRC4(check, hbuf, hold);
        }
        INITBITS();
        mode = OS;
      case OS:
        if (!NEEDBITS(16)) {
          break inf_leave;
        }
        if (head != null) {
          head.xflags = hold & 0xFF;
          head.os = hold >>> 8;
        }
        if ((flags & 0x0200) != 0) {
          CRC2(check, hbuf, hold);
        }
        INITBITS();
        mode = EXLEN;
      case EXLEN:
        if ((flags & 0x0400) != 0) {
          if (!NEEDBITS(16)) {
            break inf_leave;
          }
          length = hold;
          if (head != null) {
            head.extra_len = hold;
          }
          if ((flags & 0x0200) != 0) {
            CRC2(check, hbuf, hold);
          }
          INITBITS();
        } else if (head != null) {
          head.extra = null;
        }
        mode = EXTRA;
      case EXTRA:
        if ((flags & 0x0400) != 0) {
          copy = length;
          if (copy > avail_in) {
            copy = avail_in;
          }
          if (copy != 0) {
            if (head != null) {
              len = head.extra_len - length;
              head.extra = new byte[copy];
              System.arraycopy(next_in, next_in_index, head.extra, len, copy);
            }
            if ((flags & 0x0200) != 0) {
              check = crc32(check, next_in, next_in_index, copy);
            }
            avail_in -= copy;
            next_in_index += copy;
            length -= copy;
          }
          if (length != 0) {
            break inf_leave;
          }
        }
        length = 0;
        mode = NAME;
      case NAME:
        if ((flags & 0x0800) != 0) {
          if (avail_in == 0) {
            break inf_leave;
          }
          copy = 0;
          do {
            len = next_in[next_in_index + copy++];
            if (head != null && head.name != null && length < head.name.length) {
              head.name[length++] = (byte)len;
            }
          } while (len != 0 && copy < avail_in);
          if ((flags & 0x0200) != 0) {
            check = crc32(check, next_in, next_in_index, copy);
          }
          avail_in -= copy;
          next_in_index += copy;
          if (len != 0) {
            break inf_leave;
          }
        } else if (head != null) {
          head.name = null;
        }
        length = 0;
        mode = COMMENT;
      case COMMENT:
        if ((flags & 0x1000) != 0) {
          if (avail_in == 0) {
            break inf_leave;
          }
          copy = 0;
          do {
            len = next_in[next_in_index + copy++];
            if (head != null && head.comment != null && length < head.comment.length) {
              head.comment[length++] = (byte)len;
            }
          } while (len != 0 && copy < avail_in);
          if ((flags & 0x0200) != 0) {
            check = crc32(check, next_in, next_in_index, copy);
          }
          avail_in -= copy;
          next_in_index += copy;
          if (len != 0) {
            break inf_leave;
          }
        } else if (head != null) {
          head.comment = null;
        }
        mode = HCRC;
      case HCRC:
        if ((flags & 0x0200) != 0) {
          if (!NEEDBITS(16)) {
            break inf_leave;
          }
          if (hold != (check & 0xFFFF)) {
            throw new DeflateException("header crc mismatch");
            //msg = "header crc mismatch";
            //mode = BAD;
            //break;
          }
          INITBITS();
        }
        if (head != null) {
          head.hcrc = ((flags >>> 9) & 1) != 0;
          head.done = true;
        }
        adler = check = crc32(0, null, 0, 0);
        mode = TYPE;
        break;
      case DICTID:
        if (!NEEDBITS(32)) {
          break inf_leave;
        }
        adler = check = Integer.reverseBytes(hold);
        INITBITS();
        mode = DICT;
      case DICT:
        if (!havedict) {
          throw new DeflateException(Z_NEED_DICT);
        }
        adler = check = adler32(0, null, 0, 0);
        mode = TYPE;
      case TYPE:
        if (flush == Z_BLOCK || flush == Z_TREES) {
          break inf_leave;
        }
      case TYPEDO:
        if (this.last) {
          BYTEBITS();
          mode = CHECK;
          break;
        }
        if (!NEEDBITS(3)) {
          break inf_leave;
        }
        this.last = BITS(1) != 0;
        DROPBITS(1);
        switch (BITS(2)) {
        case 0: // stored block
          mode = STORED;
          break;
        case 1: // fixed block
          fixedtables();
          mode = LEN_; // decode codes
          if (flush == Z_TREES) {
            DROPBITS(2);
            break inf_leave;
          }
          break;
        case 2: // dynamic block
          mode = TABLE;
          break;
        case 3:
          throw new DeflateException("invalid block type");
          //msg = "invalid block type";
          //mode = BAD;
        }
        DROPBITS(2);
        break;
      case STORED:
        BYTEBITS(); // go to byte boundary
        if (!NEEDBITS(32)) {
          break inf_leave;
        }
        if ((hold & 0xFFFF) != ((hold >>> 16) ^ 0xFFFF)) {
          throw new DeflateException("invalid stored block lengths");
          //msg = "invalid stored block lengths";
          //mode = BAD;
          //break;
        }
        length = hold & 0xFFFF;
        INITBITS();
        mode = COPY_;
        if (flush == Z_TREES) {
          break inf_leave;
        }
      case COPY_:
        mode = COPY;
      case COPY:
        copy = length;
        if (copy != 0) {
          if (copy > avail_in) {
            copy = avail_in;
          }
          if (copy > avail_out) {
            copy = avail_out;
          }
          if (copy == 0) {
            break inf_leave;
          }
          System.arraycopy(next_in, next_in_index, next_out, next_out_index, copy);
          avail_in -= copy;
          next_in_index += copy;
          avail_out -= copy;
          next_out_index += copy;
          length -= copy;
          break;
        }
        mode = TYPE;
        break;
      case TABLE:
        if (!NEEDBITS(14)) {
          break inf_leave;
        }
        nlen = BITS(5) + 257;
        DROPBITS(5);
        ndist = BITS(5) + 1;
        DROPBITS(5);
        ncode = BITS(4) + 4;
        DROPBITS(4);
        if (nlen > 286 || ndist > 30) { // PKZIP_BUG_WORKAROUND
          throw new DeflateException("too many length or distance symbols");
          //msg = "too many length or distance symbols";
          //mode = BAD;
          //break;
        }
        have = 0;
        mode = LENLENS;
      case LENLENS:
        while (have < ncode) {
          if (!NEEDBITS(3)) {
            break inf_leave;
          }
          lens[order[have++]] = (short)BITS(3);
          DROPBITS(3);
        }
        while (have < 19) {
          lens[order[have++]] = 0;
        }
        next = 0;
        lencode = next;
        lenbits = 7;
        ret = inflate_table(CODES, 0, 19);
        if (ret != 0) {
          throw new DeflateException("invalid code lengths set");
          //msg = "invalid code lengths set";
          //mode = BAD;
          //break;
        }
        have = 0;
        mode = CODELENS;
      case CODELENS:
        while (have < nlen + ndist) {
          while (true) {
            here = codes[lencode + BITS(lenbits)];
            hereOp = (here >>> 24) & 0xFF;
            hereBits = (here >>> 16) & 0xFF;
            hereVal = here & 0xFFFF;
            if (hereBits <= bits) {
              break;
            }
            if (!PULLBYTE()) {
              break inf_leave;
            }
          }
          if (hereVal < 16) {
            DROPBITS(hereBits);
            lens[have++] = (short)hereVal;
          } else {
            if (hereVal == 16) {
              if (!NEEDBITS(hereBits + 2)) {
                break inf_leave;
              }
              DROPBITS(hereBits);
              if (have == 0) {
                throw new DeflateException("invalid bit length repeat");
                //msg = "invalid bit length repeat";
                //mode = BAD;
                //break;
              }
              len = lens[have - 1];
              copy = 3 + BITS(2);
              DROPBITS(2);
            } else if (hereVal == 17) {
              if (!NEEDBITS(hereBits + 3)) {
                break inf_leave;
              }
              DROPBITS(hereBits);
              len = 0;
              copy = 3 + BITS(3);
              DROPBITS(3);
            } else {
              if (!NEEDBITS(hereBits + 7)) {
                break inf_leave;
              }
              DROPBITS(hereBits);
              len = 0;
              copy = 11 + BITS(7);
              DROPBITS(7);
            }
            if (have + copy > nlen + ndist) {
              throw new DeflateException("invalid bit length repeat");
              //msg = "invalid bit length repeat";
              //mode = BAD;
              //break;
            }
            while (copy-- != 0) {
              lens[have++] = (short)len;
            }
          }
        }

        // handle error breaks in while
        if (mode == BAD) {
          break;
        }

        // check for end-of-block code (better have one)
        if (lens[256] == 0) {
          throw new DeflateException("invalid code -- missing end-of-block");
          //msg = "invalid code -- missing end-of-block";
          //mode = BAD;
          //break;
        }

        // build code tables -- note: do not change the lenbits or distbits
        // values here (9 and 6) without reading the comments in inftrees.h
        // concerning the ENOUGH constants, which depend on those values
        next = 0;
        lencode = next;
        lenbits = 9;
        ret = inflate_table(LENS, 0, nlen);
        if (ret != 0) {
          throw new DeflateException("invalid literal/lengths set");
          //msg = "invalid literal/lengths set";
          //mode = BAD;
          //break;
        }
        distcode = next;
        distbits = 6;
        ret = inflate_table(DISTS, nlen, ndist);
        if (ret != 0) {
          throw new DeflateException("invalid distances set");
          //msg = "invalid distances set";
          //mode = BAD;
          //break;
        }
        mode = LEN_;
        if (flush == Z_TREES) {
          break inf_leave;
        }
      case LEN_:
        mode = LEN;
      case LEN:
        if (avail_in >= 6 && avail_out >= 258) {
          inflate_fast(out);
          if (mode == TYPE) {
            back = -1;
          }
          break;
        }
        back = 0;
        while (true) {
          here = codes[lencode + BITS(lenbits)];
          hereOp = (here >>> 24) & 0xFF;
          hereBits = (here >>> 16) & 0xFF;
          hereVal = here & 0xFFFF;
          if (hereBits <= bits) {
            break;
          }
          if (!PULLBYTE()) {
            break inf_leave;
          }
        }
        if (hereOp != 0 && (hereOp & 0xF0) == 0) {
          last = here;
          lastOp = hereOp;
          lastBits = hereBits;
          lastVal = hereVal;
          while (true) {
            here = codes[lencode + lastVal + (BITS(lastBits + lastOp) >>> lastBits)];
            hereOp = (here >>> 24) & 0xFF;
            hereBits = (here >>> 16) & 0xFF;
            hereVal = here & 0xFFFF;
            if (lastBits + hereBits <= bits) {
              break;
            }
            if (!PULLBYTE()) {
              break inf_leave;
            }
          }
          DROPBITS(lastBits);
          back += lastBits;
        }
        DROPBITS(hereBits);
        back += hereBits;
        length = hereVal;
        if (hereOp == 0) {
          mode = LIT;
          break;
        }
        if ((hereOp & 32) != 0) {
          back = -1;
          mode = TYPE;
          break;
        }
        if ((hereOp & 64) != 0) {
          throw new DeflateException("invalid literal/length code");
          //msg = "invalid literal/length code";
          //mode = BAD;
          //break;
        }
        extra = hereOp & 15;
        mode = LENEXT;
      case LENEXT:
        if (extra != 0) {
          if (!NEEDBITS(extra)) {
            break inf_leave;
          }
          length += BITS(extra);
          DROPBITS(extra);
          back += extra;
        }
        was = length;
        mode = DIST;
      case DIST:
        while (true) {
          here = codes[distcode + BITS(distbits)];
          hereOp = (here >>> 24) & 0xFF;
          hereBits = (here >>> 16) & 0xFF;
          hereVal = here & 0xFFFF;
          if (hereBits <= bits) {
            break;
          }
          if (!PULLBYTE()) {
            break inf_leave;
          }
        }
        if ((hereOp & 0xF0) == 0) {
          last = here;
          lastOp = hereOp;
          lastBits = hereBits;
          lastVal = hereVal;
          while (true) {
            here = codes[distcode + lastVal + (BITS(lastBits + lastOp) >>> lastBits)];
            hereOp = (here >>> 24) & 0xFF;
            hereBits = (here >>> 16) & 0xFF;
            hereVal = here & 0xFFFF;
            if (lastBits + hereBits <= bits) {
              break;
            }
            if (!PULLBYTE()) {
              break inf_leave;
            }
          }
          DROPBITS(lastBits);
          back += lastBits;
        }
        DROPBITS(hereBits);
        back += hereBits;
        if ((hereOp & 64) != 0) {
          throw new DeflateException("invalid distance code");
          //msg = "invalid distance code";
          //mode = BAD;
          //break;
        }
        offset = hereVal;
        extra = hereOp & 15;
        mode = DISTEXT;
      case DISTEXT:
        if (extra != 0) {
          if (!NEEDBITS(extra)) {
            break inf_leave;
          }
          offset += BITS(extra);
          DROPBITS(extra);
          back += extra;
        }

        // INFLATE_STRICT
        //if (offset > dmax) {
        //  throw new DeflateException("invalid distance too far back");
        //  //msg = "invalid distance too far back";
        //  //mode = BAD;
        //  //break;
        //}

        mode = MATCH;
      case MATCH:
        if (avail_out == 0) {
          break inf_leave;
        }
        copy = out - avail_out;
        if (offset > copy) { // copy from window
          copy = offset - copy;
          if (copy > whave) {
            if (sane) {
              throw new DeflateException("invalid distance too far back");
              //msg = "invalid distance too far back";
              //mode = BAD;
              //break;
            }

            // INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
            //copy -= whave;
            //if (copy > length) {
            //  copy = length;
            //}
            //if (copy > avail_out) {
            //  copy = avail_out;
            //}
            //avail_out -= copy;
            //length -= copy;
            //do {
            //  next_out[next_out_index++] = 0;
            //} while (--copy != 0);
            //if (length == 0) {
            //  mode = LEN;
            //}
            //break;

          }
          if (copy > wnext) {
            copy -= wnext;
            from = wsize - copy;
          } else {
            from = wnext - copy;
          }
          if (copy > length) {
            copy = length;
          }
          if (copy > avail_out) {
            copy = avail_out;
          }
          avail_out -= copy;
          length -= copy;
          do {
            next_out[next_out_index++] = window[from++];
          } while (--copy != 0);
          from += copy;
          next_out_index += copy;
        } else { // copy from output
          from = next_out_index - offset;
          copy = length;
          if (copy > avail_out) {
            copy = avail_out;
          }
          avail_out -= copy;
          length -= copy;
          do {
            next_out[next_out_index++] = next_out[from++];
          } while (--copy != 0);
          from += copy;
          next_out_index += copy;
        }
        copy = 0;
        if (length == 0) {
          mode = LEN;
        }
        break;
      case LIT:
        if (avail_out == 0) {
          break inf_leave;
        }
        next_out[next_out_index++] = (byte)length;
        avail_out--;
        mode = LEN;
        break;
      case CHECK:
        if (wrap != 0) {
          if (!NEEDBITS(32)) {
            break inf_leave;
          }
          out -= avail_out;
          total_out += out;
          total += out;
          if (out != 0) {
            adler = check = UPDATE(check, next_out, next_out_index - out, out);
          }
          if ((flags != 0 ? hold : Integer.reverseBytes(hold)) != check) {
            throw new DeflateException("incorrect data check");
            //msg = "incorrect data check";
            //mode = BAD;
            //break;
          }
          if (output != null) {
            window_buffer = window_buffer.index(next_out_index - out)
                                         .limit(next_out_index).isPart(!is_last);
            output = output.feed(window_buffer);
            if (window_buffer.isCont()) {
              throw new DecoderException("truncated");
            }
          }
          out = avail_out;
          INITBITS();
        }
        mode = LENGTH;
      case LENGTH:
        if (wrap != 0 && flags != 0) {
          if (!NEEDBITS(32)) {
            break inf_leave;
          }
          if (hold != total) {
            throw new DeflateException("incorrect length check");
            //msg = "incorrect length check";
            //mode = BAD;
            //break;
          }
          INITBITS();
        }
        mode = DONE;
      case DONE:
        ret = Z_STREAM_END;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR;
        break inf_leave;
      case MEM:
        throw new DeflateException(Z_MEM_ERROR);
      case SYNC:
      default:
        throw new DeflateException(Z_STREAM_ERROR);
      }
    }

    // Return from inflate(), updating the total counts and the check value.
    // If there was no progress during the inflate() call, return a buffer
    // error.  Call updatewindow() to create and/or update the window state.
    in -= avail_in;
    out -= avail_out;
    total_in += in;
    total_out += out;
    total += out;
    if (wrap != 0 && out != 0) {
      adler = check = UPDATE(check, next_out, next_out_index - out, out);
    }
    if (wsize != 0 || (out != 0 && mode < BAD && (mode < CHECK || flush != Z_FINISH))) {
      if (output != null) {
        window_buffer.index(next_out_index - out).limit(next_out_index)
                     .isPart(avail_in != 0 || !is_last);
        output = output.feed(window_buffer);
        if (window_buffer.isCont()) {
          throw new DecoderException("truncated");
        }
        compactwindow(next_out_index, out);
      } else {
        updatewindow(next_out, next_out_index, out);
      }
    }
    data_type = bits + (this.last ? 64 : 0) +
                (mode == TYPE ? 128 : 0) +
                (mode == LEN_ || mode == COPY_ ? 256 : 0);
    if ((in == 0 && out == 0 || flush == Z_FINISH) && ret == Z_OK) {
      return true; // Z_BUF_ERROR;
    }
    if (mode == BAD) {
      throw new DeflateException(msg);
    }
    return false;
  }

  final void inflate_fast(int start) {
    int in; // local next_in_index
    int last; // have enough input while in < last
    int out; // local next_out_index
    int beg; // inflate()'s initial next_out
    int end; // while out < end, enough space available
    int dmax; // maximum distance from zlib header
    int wsize; // window size or zero if not using window
    int whave; // valid bytes in the window
    int wnext; // window write index
    byte[] window; // allocated sliding window, if wsize != 0
    int hold; // local hold
    int bits; // local bits
    int lcode; // local lencode
    int dcode; // local distcode
    int lmask; // mask for first level of length codes
    int dmask; // mask for first level of distance codes
    int here; // retrieved table entry
    int hereOp;
    int hereBits;
    int hereVal;
    int op; // code bits, operation, extra bits, or window position, window bytes to copy
    int len; // match length, unused bytes
    int dist; // match distance
    int from; // where to copy match from

    // copy state to local variables
    in = next_in_index;
    last = in + (avail_in - 5);
    out = next_out_index;
    beg = out - (start - avail_out);
    end = out + (avail_out - 257);
    dmax = this.dmax;
    wsize = this.wsize;
    whave = this.whave;
    wnext = this.wnext;
    window = this.window;
    hold = this.hold;
    bits = this.bits;
    lcode = lencode;
    dcode = distcode;
    lmask = (1 << lenbits) - 1;
    dmask = (1 << distbits) - 1;

    // decode literals and length/distances until end-of-block or not enough
    // input data or output space
    decode: do {
      if (bits < 15) {
        hold += (next_in[in++] & 0xFF) << bits;
        bits += 8;
        hold += (next_in[in++] & 0xFF) << bits;
        bits += 8;
      }
      here = codes[lcode + (hold & lmask)];
      hereOp = (here >>> 24) & 0xFF;
      hereBits = (here >>> 16) & 0xFF;
      hereVal = here & 0xFFFF;

      dolen: do {
        op = hereBits;
        hold >>>= op;
        bits -= op;
        op = hereOp;
        if (op == 0) { // literal
          next_out[out++] = (byte)hereVal;
          continue decode;
        } else if ((op & 16) != 0) { // length base
          len = hereVal;
          op &= 15; // number of extra bits
          if (op != 0) {
            if (bits < op) {
              hold += (next_in[in++] & 0xFF) << bits;
              bits += 8;
            }
            len += hold & ((1 << op) - 1);
            hold >>>= op;
            bits -= op;
          }
          if (bits < 15) {
            hold += (next_in[in++] & 0xFF) << bits;
            bits += 8;
            hold += (next_in[in++] & 0xFF) << bits;
            bits += 8;
          }
          here = codes[dcode + (hold & dmask)];
          hereOp = (here >>> 24) & 0xFF;
          hereBits = (here >>> 16) & 0xFF;
          hereVal = here & 0xFFFF;
          dodist: do {
            op = hereBits;
            hold >>>= op;
            bits -= op;
            op = hereOp;
            if ((op & 16) != 0) { // distance base
              dist = hereVal;
              op &= 15; // number of extra bits
              if (bits < op) {
                hold += (next_in[in++] & 0xFF) << bits;
                bits += 8;
                if (bits < op) {
                  hold += (next_in[in++] & 0xFF) << bits;
                  bits += 8;
                }
              }
              dist += hold & ((1 << op) - 1);

              // INFLATE_STRICT
              //if (dist > dmax) {
              //  throw new DeflateException("invalid distance too far back");
              //  //msg = "invalid distance too far back";
              //  //mode = BAD;
              //  //break decode;
              //}

              hold >>>= op;
              bits -= op;
              op = out - beg; // max distance in output
              if (dist > op) { // see if copy from window
                op = dist - op; // distance back in window
                if (op > whave) {
                  if (sane) {
                    throw new DeflateException("invalid distance too far back");
                    //msg = "invalid distance too far back";
                    //mode = BAD;
                    //break decode;
                  }

                  // INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
                  //if (len <= op - whave) {
                  //  do {
                  //    next_out[out++] = 0;
                  //  } while (--len != 0);
                  //  continue decode;
                  //}
                  //len -= op - whave;
                  //do {
                  //  next_out[out++] = 0;
                  //} while (--op > whave);
                  //if (op == 0) {
                  //  from = out - dist;
                  //  do {
                  //    next_out[out++] = window[from++];
                  //  } while (--len != 0);
                  //  continue decode;
                  //}

                }
                from = 0;
                if (wnext == 0) { // very common case
                  from += wsize - op;
                  if (op < len) { // some from window
                    len -= op;
                    do {
                      next_out[out++] = window[from++];
                    } while (--op != 0);
                    from = out - dist; // rest from output
                  }
                } else if (wnext < op) { // wrap around window
                  from += wsize + wnext - op;
                  op -= wnext;
                  if (op < len) { // some from end of window
                    len -= op;
                    do {
                      next_out[out++] = window[from++];
                    } while (--op != 0);
                    from = 0;
                    if (wnext < len) { // some from start of window
                      op = wnext;
                      len -= op;
                      do {
                        next_out[out++] = window[from++];
                      } while (--op != 0);
                      from = out - dist; // rest from output
                    }
                  }
                } else { // contiguous in window
                  from += wnext - op;
                  if (op < len) { // some from window
                    len -= op;
                    do {
                      next_out[out++] = window[from++];
                    } while (--op != 0);
                    from = out - dist; // rest from output
                  }
                }
                while (len > 2) {
                  next_out[out++] = next_out[from++];
                  next_out[out++] = next_out[from++];
                  next_out[out++] = next_out[from++];
                  len -= 3;
                }
                if (len != 0) {
                  next_out[out++] = next_out[from++];
                  if (len > 1)
                    next_out[out++] = next_out[from++];
                }
              } else {
                from = out - dist; // copy direct from output
                do { // minimum length is three
                  next_out[out++] = next_out[from++];
                  next_out[out++] = next_out[from++];
                  next_out[out++] = next_out[from++];
                  len -= 3;
                } while (len > 2);
                if (len != 0) {
                  next_out[out++] = next_out[from++];
                  if (len > 1) {
                    next_out[out++] = next_out[from++];
                  }
                }
              }
              continue decode;
            } else if ((op & 64) == 0) { // 2nd level distance code
              here = codes[dcode + hereVal + (hold & ((1 << op) - 1))];
              hereOp = (here >>> 24) & 0xFF;
              hereBits = (here >>> 16) & 0xFF;
              hereVal = here & 0xFFFF;
              continue dodist;
            } else {
              throw new DeflateException("invalid distance code");
              //msg = "invalid distance code";
              //mode = BAD;
              //break decode;
            }
          } while (true);
        } else if ((op & 64) == 0) { // 2nd level length code
          here = codes[lcode + hereVal + (hold & ((1 << op) - 1))];
          hereOp = (here >>> 24) & 0xFF;
          hereBits = (here >>> 16) & 0xFF;
          hereVal = here & 0xFFFF;
          continue dolen;
        } else if ((op & 32) != 0) { // end-of-block
          mode = TYPE;
          break decode;
        } else {
          throw new DeflateException("invalid literal/length code");
          //msg = "invalid literal/length code";
          //mode = BAD;
          //break decode;
        }
      } while (true);
    } while (in < last && out < end);

    // return unused bytes (on entry, bits < 8, so in won't go too far back)
    len = bits >>> 3;
    in -= len;
    bits -= len << 3;
    hold &= (1 << bits) - 1;

    // update state and return
    next_in_index = in;
    next_out_index = out;
    avail_in = in < last ? 5 + (last - in) : 5 - (in - last);
    avail_out = out < end ? 257 + (end - out) : 257 - (out - end);
    this.hold = hold;
    this.bits = bits;
  }

  // Return state with length and distance decoding tables and index sizes set to
  // fixed code decoding.
  final void fixedtables() {
    codes = fixed;
    lencode = lenfix;
    lenbits = 9;
    distcode = distfix;
    distbits = 5;
  }

  // Build a set of tables to decode the provided canonical Huffman code.
  final int inflate_table(int type, int offset, int length) {
    int len; // a code's length in bits
    int sym; // index of code symbols
    int min, max; // minimum and maximum code lengths
    int root; // number of index bits for root table
    int curr; // number of index bits for current table
    int drop; // code bits to drop for sub-table
    int left; // number of prefix codes available
    int used; // code entries in table used
    int huff; // Huffman code
    int incr; // for incrementing code, index
    int fill; // index for replicating entries
    int low;  // low bits for current root entry
    int mask; // mask for low root bits
    int here; // table entry for duplication
    int hereOp;
    int hereBits;
    int hereVal;
    int next; // next available space in codes table
    short[] base; // base value table to use
    int base_index;
    short[] extra; // extra bits table to use
    int extra_index;
    int end; // use base and extra for symbol > end
    short[] count = new short[MAXBITS + 1]; // number of codes of each length
    short[] offs = new short[MAXBITS + 1]; // offsets in table for each length

    // Process a set of code lengths to create a canonical Huffman code.  The
    // code lengths are lens[0..length-1].  Each length corresponds to the
    // symbols 0..length-1.  The Huffman code is generated by first sorting the
    // symbols by length from short to long, and retaining the symbol order
    // for codes with equal lengths.  Then the code starts with all zero bits
    // for the first code of the shortest length, and the codes are integer
    // increments for the same length, and zeros are appended as the length
    // increases.  For the deflate format, these bits are stored backwards
    // from their more natural integer increment ordering, and so when the
    // decoding tables are built in the large loop below, the integer codes
    // are incremented backwards.
    //
    // This routine assumes, but does not check, that all of the entries in
    // lens[] are in the range 0..MAXBITS.  The caller must assure this.
    // 1..MAXBITS is interpreted as that code length.  zero means that that
    // symbol does not occur in this code.
    //
    // The codes are sorted by computing a count of codes for each length,
    // creating from that a table of starting indices for each length in the
    // sorted table, and then entering the symbols in order in the sorted
    // table.  The sorted table is work[], with that space being provided by
    // the caller.
    //
    // The length counts are used for other purposes as well, i.e. finding
    // the minimum and maximum length codes, determining if there are any
    // codes at all, checking for a valid set of lengths, and looking ahead
    // at length counts to determine sub-table sizes when building the
    // decoding tables.

    // accumulate lengths for codes (assumes lens[] all in 0..MAXBITS)
    for (len = 0; len <= MAXBITS; len++) {
      count[len] = 0;
    }
    for (sym = 0; sym < length; sym++) {
      count[lens[offset + sym]]++;
    }

    // bound code lengths, force root to be within code lengths
    root = type == DISTS ? distbits : lenbits;
    for (max = MAXBITS; max >= 1; max--) {
      if (count[max] != 0) {
        break;
      }
    }
    if (root > max) {
      root = max;
    }
    if (max == 0) { // no symbols to code at all
      hereOp = 64; // invalid code marker
      hereBits = 1;
      hereVal = 0;
      here = code(hereOp, hereBits, hereVal);
      codes[this.next++] = here; // make a table to force an error
      codes[this.next++] = here;
      if (type == DISTS) {
        distbits = 1;
      } else {
        lenbits = 1;
      }
      return 0; // no symbols, but wait for decoding to report error
    }
    for (min = 1; min < max; min++) {
      if (count[min] != 0) {
        break;
      }
    }
    if (root < min) {
      root = min;
    }

    // check for an over-subscribed or incomplete set of lengths
    left = 1;
    for (len = 1; len <= MAXBITS; len++) {
      left <<= 1;
      left -= count[len];
      if (left < 0) {
        return -1; // over-subscribed
      }
    }
    if (left > 0 && (type == CODES || max != 1)) {
      return -1; // incomplete set
    }

    // generate offsets into symbol table for each length for sorting
    offs[1] = 0;
    for (len = 1; len < MAXBITS; len++) {
      offs[len + 1] = (short)(offs[len] + count[len]);
    }

    // sort symbols by length, by symbol order within each length
    for (sym = 0; sym < length; sym++) {
      if (lens[offset + sym] != 0) {
        work[offs[lens[offset + sym]]++] = (short)sym;
      }
    }

    // Create and fill in decoding tables.  In this loop, the table being
    // filled is at next and has curr index bits.  The code being used is huff
    // with length len.  That code is converted to an index by dropping drop
    // bits off of the bottom.  For codes where len is less than drop + curr,
    // those top drop + curr - len bits are incremented through all values to
    // fill the table with replicated entries.
    //
    // root is the number of index bits for the root table.  When len exceeds
    // root, sub-tables are created pointed to by the root entry with an index
    // of the low root bits of huff.  This is saved in low to check for when a
    // new sub-table should be started.  drop is zero when the root table is
    // being filled, and drop is root when sub-tables are being filled.
    //
    // When a new sub-table is needed, it is necessary to look ahead in the
    // code lengths to determine what size sub-table is needed.  The length
    // counts are used for this, and so count[] is decremented as codes are
    // entered in the tables.
    //
    // used keeps track of how many table entries have been allocated from the
    // provided *table space.  It is checked for LENS and DIST tables against
    // the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
    // the initial root table size constants.  See the comments in inftrees.h
    // for more information.
    //
    // sym increments through all symbols, and the loop terminates when
    // all codes of length max, i.e. all codes, have been processed.  This
    // routine permits incomplete codes, so another loop after this one fills
    // in the rest of the decoding tables with invalid code markers.

    // set up for code type
    switch (type) {
    case CODES:
      base = extra = work; // dummy value--not used
      base_index = extra_index = 0;
      end = 19;
      break;
    case LENS:
      base = lbase;
      base_index = -257;
      extra = lext;
      extra_index = -257;
      end = 256;
      break;
    default: // DISTS
      base = dbase;
      base_index = 0;
      extra = dext;
      extra_index = 0;
      end = -1;
    }

    // initialize state for loop
    huff = 0; // starting code
    sym = 0; // starting code symbol
    len = min; // starting code length
    next = this.next; // current table to fill in
    curr = root; // current table index bits
    drop = 0; // current bits to drop from code for index
    low = -1; // trigger new sub-table when len > root
    used = 1 << root; // use root table entries
    mask = used - 1; // mask for comparing low

    // check available table space
    if (type == LENS && used > ENOUGH_LENS || type == DISTS && used > ENOUGH_DISTS) {
      return 1;
    }

    // process all codes and make table entries
    while (true) {
      // create table entry
      hereBits = len - drop;
      if (work[sym] < end) {
        hereOp = 0;
        hereVal = work[sym];
      } else if (work[sym] > end) {
        hereOp = extra[extra_index + work[sym]];
        hereVal = base[base_index + work[sym]];
      } else {
        hereOp = 32 + 64; // end of block
        hereVal = 0;
      }
      here = code(hereOp, hereBits, hereVal);

      // replicate for those indices with low len bits equal to huff
      incr = 1 << (len - drop);
      fill = 1 << curr;
      min = fill; // save offset to next table
      do {
        fill -= incr;
        codes[next + (huff >>> drop) + fill] = here;
      } while (fill != 0);

      // backwards increment the len-bit code huff
      incr = 1 << (len - 1);
      while ((huff & incr) != 0) {
        incr >>>= 1;
      }
      if (incr != 0) {
        huff &= incr - 1;
        huff += incr;
      } else {
        huff = 0;
      }

      // go to next symbol, update count, len
      sym++;
      if (--count[len] == 0) {
        if (len == max) {
          break;
        }
        len = lens[offset + work[sym]];
      }

      // create new sub-table if needed
      if (len > root && (huff & mask) != low) {
        // if first time, transition to sub-tables
        if (drop == 0) {
          drop = root;
        }

        // increment past last table
        next += min; // here min is 1 << curr

        // determine length of next table
        curr = len - drop;
        left = 1 << curr;
        while (curr + drop < max) {
          left -= count[curr + drop];
          if (left <= 0) {
            break;
          }
          curr++;
          left <<= 1;
        }

        // check for enough space
        used += 1 << curr;
        if (type == LENS && used > ENOUGH_LENS || type == DISTS && used > ENOUGH_DISTS) {
          return 1;
        }

        // point entry in root table to sub-table
        low = huff & mask;
        codes[this.next + low] = code(curr, root, next - this.next);
      }
    }

    // fill in remaining table entry if code is incomplete (guaranteed to have
    // at most one remaining entry, since if the code is incomplete, the
    // maximum code length that was allowed to get this far is one bit)
    if (huff != 0) {
      hereOp = 64; // invalid code marker
      hereBits = len - drop;
      hereVal = 0;
      here = code(hereOp, hereBits, hereVal);
      codes[next + huff] = here;
    }

    // set return parameters
    this.next += used;
    if (type == DISTS) {
      distbits = root;
    } else {
      lenbits = root;
    }
    return 0;
  }

  final void compactwindow(int end, int copy) {
    if (end > wsize) {
      System.arraycopy(window, end - wsize, window, 0, wsize);
      wnext = wsize;
    } else {
      wnext = end;
    }
    whave = wnext;
  }

  // Update the window with the last wsize (normally 32K) bytes written before
  // returning.  If window does not exist yet, create it.  This is only called
  // when a window is already in use, or when output has been written during this
  // inflate call, but the end of the deflate stream has not been reached yet.
  // It is also called to create a window for dictionary data when a dictionary
  // is loaded.
  //
  // Providing output buffers larger than 32K to inflate() should provide a speed
  // advantage, since only the last 32K of output is copied to the sliding window
  // upon return from inflate(), and since all distances after the first 32K of
  // output will fall in the output data, making match copies simpler and faster.
  // The advantage may be dependent on the size of the processor's data caches.
  final void updatewindow(byte[] output, int end, int copy) {
    int dist;

    // if it hasn't been done already, allocate space for the window
    if (window == null) {
      window = new byte[1 << wbits];
      window_buffer = Binary.inputBuffer(window);
    }

    // if window not in use yet, initialize
    if (wsize == 0) {
      wsize = 1 << wbits;
      wnext = 0;
      whave = 0;
    }

    // copy wsize or less output bytes into the circular window
    if (copy >= wsize) {
      System.arraycopy(output, end - wsize, window, 0, wsize);
      wnext = 0;
      whave = wsize;
    } else {
      dist = wsize - wnext;
      if (dist > copy) {
        dist = copy;
      }
      System.arraycopy(output, end - copy, window, wnext, dist);
      copy -= dist;
      if (copy != 0) {
        System.arraycopy(output, end - copy, window, 0, copy);
        wnext = copy;
        whave = wsize;
      } else {
        wnext += dist;
        if (wnext == wsize) {
          wnext = 0;
        }
        if (whave < wsize) {
          whave += dist;
        }
      }
    }
  }

  // Clear the input bit accumulator
  final void INITBITS() {
    hold = 0;
    bits = 0;
  }

  // Get a byte of input into the bit accumulator, or return false
  // if there is no input available.
  final boolean PULLBYTE() {
    if (avail_in == 0) {
      return false;
    }
    avail_in--;
    hold += (next_in[next_in_index++] & 0xFF) << bits;
    bits += 8;
    return true;
  }

  // Assure that there are at least n bits in the bit accumulator.  If there is
  // not enough available input to do that, then return false.
  final boolean NEEDBITS(int n) {
    while (bits < n) {
      if (!PULLBYTE()) {
        return false;
      }
    }
    return true;
  }

  // Return the low n bits of the bit accumulator (n < 16)
  final int BITS(int n) {
    return hold & ((1 << n) - 1);
  }

  // Remove n bits from the bit accumulator
  final void DROPBITS(int n) {
    hold >>>= n;
    bits -= n;
  }

  // Remove zero to seven bits as needed to go to a byte boundary
  final void BYTEBITS() {
    hold >>>= bits & 7;
    bits -= bits & 7;
  }

  // check function to use adler32() for zlib or crc32() for gzip
  final int UPDATE(int check, byte[] buf, int off, int len) {
    if (wrap == 1) {
      return adler32(check, buf, off, len);
    } else if (wrap == 2) {
      return crc32(check, buf, off, len);
    } else {
      return check;
    }
  }

  // check for header crc
  final void CRC2(int check, byte[] hbuf, int word) {
    hbuf[0] = (byte)word;
    hbuf[1] = (byte)(word >>> 8);
    check = crc32(check, hbuf, 0, 2);
  }
  final void CRC4(int check, byte[] hbuf, int word) {
    hbuf[0] = (byte)word;
    hbuf[1] = (byte)(word >> 8);
    hbuf[2] = (byte)(word >> 16);
    hbuf[3] = (byte)(word >> 24);
    check = crc32(check, hbuf, 0, 4);
  }


  static int code(int op, int bits, int val) {
    return ((op & 0xFF) << 24) | ((bits & 0xFF) << 16) | (val & 0xFFFF);
  }

  // Allowed flush values
  public static final int Z_NO_FLUSH = 0;
  public static final int Z_PARTIAL_FLUSH = 1;
  public static final int Z_SYNC_FLUSH = 2;
  public static final int Z_FULL_FLUSH = 3;
  public static final int Z_FINISH = 4;
  public static final int Z_BLOCK = 5;
  public static final int Z_TREES = 6;

  // Return codes for the compression/decompression functions. Negative values
  // are errors, positive values are used for special but normal events.
  public static final int Z_OK = 0;
  public static final int Z_STREAM_END = 1;
  public static final int Z_NEED_DICT = 2;
  public static final int Z_ERRNO = -1;
  public static final int Z_STREAM_ERROR = -2;
  public static final int Z_DATA_ERROR = -3;
  public static final int Z_MEM_ERROR = -4;
  public static final int Z_BUF_ERROR = -5;
  public static final int Z_VERSION_ERROR = -6;

  // Wrappers
  public static final int Z_NO_WRAP = 0;
  public static final int Z_WRAP_ZLIB = 1;
  public static final int Z_WRAP_GZIP = 2;

  // Default windowBits for decompression
  public static final int DEF_WBITS = 15;

  // The deflate compression method
  static final int Z_DEFLATED = 8;

  // Maximum size of the dynamic table.  The maximum number of code structures is
  // 1444, which is the sum of 852 for literal/length codes and 592 for distance
  // codes.  These values were found by exhaustive searches using the program
  // examples/enough.c found in the zlib distribtution.  The arguments to that
  // program are the number of symbols, the initial root table size, and the
  // maximum bit length of a code.  "enough 286 9 15" for literal/length codes
  // returns returns 852, and "enough 30 6 15" for distance codes returns 592.
  // The initial root table size (9 or 6) is found in the fifth argument of the
  // inflate_table() calls in inflate.c and infback.c.  If the root table size is
  // changed, then these maximum sizes would be need to be recalculated and
  // updated.
  static final int ENOUGH_LENS = 852;
  static final int ENOUGH_DISTS = 592;
  static final int ENOUGH = ENOUGH_LENS + ENOUGH_DISTS;

  static final int HEAD = 0; // i: waiting for magic header
  static final int FLAGS = 1; // i: waiting for method and flags (gzip)
  static final int TIME = 2; // i: waiting for modification time (gzip)
  static final int OS = 3; // i: waiting for extra flags and operating system (gzip)
  static final int EXLEN = 4; // i: waiting for extra length (gzip)
  static final int EXTRA = 5; // i: waiting for extra bytes (gzip)
  static final int NAME = 6; // i: waiting for end of file name (gzip)
  static final int COMMENT = 7; // i: waiting for end of comment (gzip)
  static final int HCRC = 8; // i: waiting for header crc (gzip)
  static final int DICTID = 9; // i: waiting for dictionary check value
  static final int DICT = 10; // waiting for inflateSetDictionary() call
  static final int   TYPE = 11; // i: waiting for type bits, including last-flag bit
  static final int   TYPEDO = 12; // i: same, but skip check to exit inflate on new block
  static final int   STORED = 13; // i: waiting for stored size (length and complement)
  static final int   COPY_ = 14; // i/o: same as COPY below, but only first time in
  static final int   COPY = 15; // i/o: waiting for input or output to copy stored block
  static final int   TABLE = 16; // i: waiting for dynamic block table lengths
  static final int   LENLENS = 17; // i: waiting for code length code lengths
  static final int   CODELENS = 18; // i: waiting for length/lit and distance code lengths
  static final int     LEN_ = 19; // i: same as LEN below, but only first time in
  static final int     LEN = 20; // i: waiting for length/lit/eob code
  static final int     LENEXT = 21; // i: waiting for length extra bits
  static final int     DIST = 22; // i: waiting for distance code
  static final int     DISTEXT = 23; // i: waiting for distance extra bits
  static final int     MATCH = 24; // o: waiting for output space to copy string
  static final int     LIT = 25; // o: waiting for output space to write literal
  static final int CHECK = 26; // i: waiting for 32-bit check value
  static final int LENGTH = 27; // i: waiting for 32-bit length (gzip)
  static final int DONE = 28; // finished check, done -- remain here until reset
  static final int BAD = 29; // got a data error -- remain here until reset
  static final int MEM = 30; // got an inflate() memory error -- remain here until reset
  static final int SYNC = 31; // looking for synchronization bytes to restart inflate()

  // Type of code to build for inflate_table()
  static final int CODES = 0;
  static final int LENS = 1;
  static final int DISTS = 2;

  static final int MAXBITS = 15;

  // permutation of code lengths
  static final short[] order = {
    16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15
  };

  // Length codes 257..285 base
  static final short[] lbase = {
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
    35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
  };

  // Length codes 257..285 extra
  static final short[] lext = {
    16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
    19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
  };

  // Distance codes 0..29 base
  static final short[] dbase = {
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
    8193, 12289, 16385, 24577, 0, 0
  };

  // Distance codes 0..29 extra
  static final short[] dext = {
    16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
    23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
    28, 28, 29, 29, 64, 64
  };

  static final int lenfix = 0;
  static final int distfix = 512;
  static final int[] fixed = {
    // 512 lencodes
    code(96,7,0), code(0,8,80), code(0,8,16), code(20,8,115),
    code(18,7,31), code(0,8,112), code(0,8,48), code(0,9,192),
    code(16,7,10), code(0,8,96), code(0,8,32), code(0,9,160),
    code(0,8,0), code(0,8,128), code(0,8,64), code(0,9,224),
    code(16,7,6), code(0,8,88), code(0,8,24), code(0,9,144),
    code(19,7,59), code(0,8,120), code(0,8,56), code(0,9,208),
    code(17,7,17), code(0,8,104), code(0,8,40), code(0,9,176),
    code(0,8,8), code(0,8,136), code(0,8,72), code(0,9,240),
    code(16,7,4), code(0,8,84), code(0,8,20), code(21,8,227),
    code(19,7,43), code(0,8,116), code(0,8,52), code(0,9,200),
    code(17,7,13), code(0,8,100), code(0,8,36), code(0,9,168),
    code(0,8,4), code(0,8,132), code(0,8,68), code(0,9,232),
    code(16,7,8), code(0,8,92), code(0,8,28), code(0,9,152),
    code(20,7,83), code(0,8,124), code(0,8,60), code(0,9,216),
    code(18,7,23), code(0,8,108), code(0,8,44), code(0,9,184),
    code(0,8,12), code(0,8,140), code(0,8,76), code(0,9,248),
    code(16,7,3), code(0,8,82), code(0,8,18), code(21,8,163),
    code(19,7,35), code(0,8,114), code(0,8,50), code(0,9,196),
    code(17,7,11), code(0,8,98), code(0,8,34), code(0,9,164),
    code(0,8,2), code(0,8,130), code(0,8,66), code(0,9,228),
    code(16,7,7), code(0,8,90), code(0,8,26), code(0,9,148),
    code(20,7,67), code(0,8,122), code(0,8,58), code(0,9,212),
    code(18,7,19), code(0,8,106), code(0,8,42), code(0,9,180),
    code(0,8,10), code(0,8,138), code(0,8,74), code(0,9,244),
    code(16,7,5), code(0,8,86), code(0,8,22), code(64,8,0),
    code(19,7,51), code(0,8,118), code(0,8,54), code(0,9,204),
    code(17,7,15), code(0,8,102), code(0,8,38), code(0,9,172),
    code(0,8,6), code(0,8,134), code(0,8,70), code(0,9,236),
    code(16,7,9), code(0,8,94), code(0,8,30), code(0,9,156),
    code(20,7,99), code(0,8,126), code(0,8,62), code(0,9,220),
    code(18,7,27), code(0,8,110), code(0,8,46), code(0,9,188),
    code(0,8,14), code(0,8,142), code(0,8,78), code(0,9,252),
    code(96,7,0), code(0,8,81), code(0,8,17), code(21,8,131),
    code(18,7,31), code(0,8,113), code(0,8,49), code(0,9,194),
    code(16,7,10), code(0,8,97), code(0,8,33), code(0,9,162),
    code(0,8,1), code(0,8,129), code(0,8,65), code(0,9,226),
    code(16,7,6), code(0,8,89), code(0,8,25), code(0,9,146),
    code(19,7,59), code(0,8,121), code(0,8,57), code(0,9,210),
    code(17,7,17), code(0,8,105), code(0,8,41), code(0,9,178),
    code(0,8,9), code(0,8,137), code(0,8,73), code(0,9,242),
    code(16,7,4), code(0,8,85), code(0,8,21), code(16,8,258),
    code(19,7,43), code(0,8,117), code(0,8,53), code(0,9,202),
    code(17,7,13), code(0,8,101), code(0,8,37), code(0,9,170),
    code(0,8,5), code(0,8,133), code(0,8,69), code(0,9,234),
    code(16,7,8), code(0,8,93), code(0,8,29), code(0,9,154),
    code(20,7,83), code(0,8,125), code(0,8,61), code(0,9,218),
    code(18,7,23), code(0,8,109), code(0,8,45), code(0,9,186),
    code(0,8,13), code(0,8,141), code(0,8,77), code(0,9,250),
    code(16,7,3), code(0,8,83), code(0,8,19), code(21,8,195),
    code(19,7,35), code(0,8,115), code(0,8,51), code(0,9,198),
    code(17,7,11), code(0,8,99), code(0,8,35), code(0,9,166),
    code(0,8,3), code(0,8,131), code(0,8,67), code(0,9,230),
    code(16,7,7), code(0,8,91), code(0,8,27), code(0,9,150),
    code(20,7,67), code(0,8,123), code(0,8,59), code(0,9,214),
    code(18,7,19), code(0,8,107), code(0,8,43), code(0,9,182),
    code(0,8,11), code(0,8,139), code(0,8,75), code(0,9,246),
    code(16,7,5), code(0,8,87), code(0,8,23), code(64,8,0),
    code(19,7,51), code(0,8,119), code(0,8,55), code(0,9,206),
    code(17,7,15), code(0,8,103), code(0,8,39), code(0,9,174),
    code(0,8,7), code(0,8,135), code(0,8,71), code(0,9,238),
    code(16,7,9), code(0,8,95), code(0,8,31), code(0,9,158),
    code(20,7,99), code(0,8,127), code(0,8,63), code(0,9,222),
    code(18,7,27), code(0,8,111), code(0,8,47), code(0,9,190),
    code(0,8,15), code(0,8,143), code(0,8,79), code(0,9,254),
    code(96,7,0), code(0,8,80), code(0,8,16), code(20,8,115),
    code(18,7,31), code(0,8,112), code(0,8,48), code(0,9,193),
    code(16,7,10), code(0,8,96), code(0,8,32), code(0,9,161),
    code(0,8,0), code(0,8,128), code(0,8,64), code(0,9,225),
    code(16,7,6), code(0,8,88), code(0,8,24), code(0,9,145),
    code(19,7,59), code(0,8,120), code(0,8,56), code(0,9,209),
    code(17,7,17), code(0,8,104), code(0,8,40), code(0,9,177),
    code(0,8,8), code(0,8,136), code(0,8,72), code(0,9,241),
    code(16,7,4), code(0,8,84), code(0,8,20), code(21,8,227),
    code(19,7,43), code(0,8,116), code(0,8,52), code(0,9,201),
    code(17,7,13), code(0,8,100), code(0,8,36), code(0,9,169),
    code(0,8,4), code(0,8,132), code(0,8,68), code(0,9,233),
    code(16,7,8), code(0,8,92), code(0,8,28), code(0,9,153),
    code(20,7,83), code(0,8,124), code(0,8,60), code(0,9,217),
    code(18,7,23), code(0,8,108), code(0,8,44), code(0,9,185),
    code(0,8,12), code(0,8,140), code(0,8,76), code(0,9,249),
    code(16,7,3), code(0,8,82), code(0,8,18), code(21,8,163),
    code(19,7,35), code(0,8,114), code(0,8,50), code(0,9,197),
    code(17,7,11), code(0,8,98), code(0,8,34), code(0,9,165),
    code(0,8,2), code(0,8,130), code(0,8,66), code(0,9,229),
    code(16,7,7), code(0,8,90), code(0,8,26), code(0,9,149),
    code(20,7,67), code(0,8,122), code(0,8,58), code(0,9,213),
    code(18,7,19), code(0,8,106), code(0,8,42), code(0,9,181),
    code(0,8,10), code(0,8,138), code(0,8,74), code(0,9,245),
    code(16,7,5), code(0,8,86), code(0,8,22), code(64,8,0),
    code(19,7,51), code(0,8,118), code(0,8,54), code(0,9,205),
    code(17,7,15), code(0,8,102), code(0,8,38), code(0,9,173),
    code(0,8,6), code(0,8,134), code(0,8,70), code(0,9,237),
    code(16,7,9), code(0,8,94), code(0,8,30), code(0,9,157),
    code(20,7,99), code(0,8,126), code(0,8,62), code(0,9,221),
    code(18,7,27), code(0,8,110), code(0,8,46), code(0,9,189),
    code(0,8,14), code(0,8,142), code(0,8,78), code(0,9,253),
    code(96,7,0), code(0,8,81), code(0,8,17), code(21,8,131),
    code(18,7,31), code(0,8,113), code(0,8,49), code(0,9,195),
    code(16,7,10), code(0,8,97), code(0,8,33), code(0,9,163),
    code(0,8,1), code(0,8,129), code(0,8,65), code(0,9,227),
    code(16,7,6), code(0,8,89), code(0,8,25), code(0,9,147),
    code(19,7,59), code(0,8,121), code(0,8,57), code(0,9,211),
    code(17,7,17), code(0,8,105), code(0,8,41), code(0,9,179),
    code(0,8,9), code(0,8,137), code(0,8,73), code(0,9,243),
    code(16,7,4), code(0,8,85), code(0,8,21), code(16,8,258),
    code(19,7,43), code(0,8,117), code(0,8,53), code(0,9,203),
    code(17,7,13), code(0,8,101), code(0,8,37), code(0,9,171),
    code(0,8,5), code(0,8,133), code(0,8,69), code(0,9,235),
    code(16,7,8), code(0,8,93), code(0,8,29), code(0,9,155),
    code(20,7,83), code(0,8,125), code(0,8,61), code(0,9,219),
    code(18,7,23), code(0,8,109), code(0,8,45), code(0,9,187),
    code(0,8,13), code(0,8,141), code(0,8,77), code(0,9,251),
    code(16,7,3), code(0,8,83), code(0,8,19), code(21,8,195),
    code(19,7,35), code(0,8,115), code(0,8,51), code(0,9,199),
    code(17,7,11), code(0,8,99), code(0,8,35), code(0,9,167),
    code(0,8,3), code(0,8,131), code(0,8,67), code(0,9,231),
    code(16,7,7), code(0,8,91), code(0,8,27), code(0,9,151),
    code(20,7,67), code(0,8,123), code(0,8,59), code(0,9,215),
    code(18,7,19), code(0,8,107), code(0,8,43), code(0,9,183),
    code(0,8,11), code(0,8,139), code(0,8,75), code(0,9,247),
    code(16,7,5), code(0,8,87), code(0,8,23), code(64,8,0),
    code(19,7,51), code(0,8,119), code(0,8,55), code(0,9,207),
    code(17,7,15), code(0,8,103), code(0,8,39), code(0,9,175),
    code(0,8,7), code(0,8,135), code(0,8,71), code(0,9,239),
    code(16,7,9), code(0,8,95), code(0,8,31), code(0,9,159),
    code(20,7,99), code(0,8,127), code(0,8,63), code(0,9,223),
    code(18,7,27), code(0,8,111), code(0,8,47), code(0,9,191),
    code(0,8,15), code(0,8,143), code(0,8,79), code(0,9,255),

    // 32 distcodes
    code(16,5,1), code(23,5,257), code(19,5,17), code(27,5,4097),
    code(17,5,5), code(25,5,1025), code(21,5,65), code(29,5,16385),
    code(16,5,3), code(24,5,513), code(20,5,33), code(28,5,8193),
    code(18,5,9), code(26,5,2049), code(22,5,129), code(64,5,0),
    code(16,5,2), code(23,5,385), code(19,5,25), code(27,5,6145),
    code(17,5,7), code(25,5,1537), code(21,5,97), code(29,5,24577),
    code(16,5,4), code(24,5,769), code(20,5,49), code(28,5,12289),
    code(18,5,13), code(26,5,3073), code(22,5,193), code(64,5,0)
  };
}
