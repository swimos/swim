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
import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;
import static swim.deflate.Adler32.adler32;
import static swim.deflate.CRC32.crc32;

@SuppressWarnings("checkstyle:all")
public class Deflate<O> extends Encoder<Encoder<?, O>, O> implements Cloneable {
  // deflated input source
  public Encoder<?, O> input;

  // flush mode for pull operations
  protected int flush;

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

  // as the name implies
  int status;

  // output still pending
  byte[] pending_buf;

  // size of pending_buf
  //int pending_buf_size;

  // next pending byte to output to the stream
  int pending_out;

  // number of bytes in the pending buffer
  int pending;

  // bit 0 true for zlib, bit 1 true for gzip
  int wrap;

  // gzip header information to write
  GzHeader gzhead;

  // where in extra, name, or comment
  int gzindex;

  // can only be DEFLATED
  //byte method;

  // value of flush param for previous deflate call
  int last_flush;

  // LZ77 window size (32K by default)
  int w_size;

  // log2(w_size) (8..16)
  int w_bits;

  // w_size - 1
  int w_mask;

  // Sliding window. Input bytes are read into the second half of the window,
  // and move to the first half later to keep a dictionary of at least wSize
  // bytes. With this organization, matches are limited to a distance of
  // wSize-MAX_MATCH bytes, but this ensures that IO is always
  // performed with a length multiple of the block size. Also, it limits
  // the window size to 64K, which is quite useful on MSDOS.
  // To do: use the user input buffer as sliding window.
  byte[] window;

  // Input writes directly to sliding window through this buffer.
  OutputBuffer<?> window_buffer;

  // Actual size of window: 2*wSize, except when the user input buffer
  // is directly used as sliding window.
  int window_size;

  // Link to older string with same hash index. To limit the size of this
  // array to 64K, this link is maintained only for the last 32K strings.
  // An index in this array is thus a window index modulo 32K.
  short[] prev;

  // Heads of the hash chains or NIL.
  short[] head;

  // hash index of string to be inserted
  int ins_h;

  // number of elements in hash table
  int hash_size;

  // log2(hash_size)
  int hash_bits;

  // hash_size-1
  int hash_mask;

  // Number of bits by which ins_h must be shifted at each input
  // step. It must be such that after MIN_MATCH steps, the oldest
  // byte no longer takes part in the hash key, that is:
  // hash_shift * MIN_MATCH >= hash_bits
  int hash_shift;

  // Window position at the beginning of the current output block. Gets
  // negative when the window is moved backwards.
  int block_start;

  // length of best match
  int match_length;

  // previous match
  int prev_match;

  // set if previous match exists
  int match_available;

  // start of string to insert
  int strstart;

  // start of matching string
  int match_start;

  // number of valid bytes ahead in window
  int lookahead;

  // Length of the best match at previous step. Matches not greater than this
  // are discarded. This is used in the lazy match evaluation.
  int prev_length;

  // To speed up deflation, hash chains are never searched beyond this length.
  // A higher limit improves compression ratio but degrades the speed.
  int max_chain_length;

  // Attempt to find a better match only when the current match is strictly
  // smaller than this value. This mechanism is used only for compression
  // levels >= 4.
  int max_lazy_match;

  // compression level (1..9)
  int level;

  // favor or force Huffman coding
  int strategy;

  // Use a faster search when the previous match is longer than this
  int good_match;

  // Stop searching when current match exceeds this
  int nice_match;

  // literal and length tree
  short[] dyn_ltree = new short[HEAP_SIZE * 2];

  // distance tree
  short[] dyn_dtree = new short[(2 * D_CODES + 1) * 2];

  // Huffman tree for bit lengths
  short[] bl_tree = new short[(2 * BL_CODES + 1) * 2];

  // desc for literal tree;
  Tree l_desc;

  // desc for distance tree
  Tree d_desc;

  // desc for bit length tree
  Tree bl_desc;

  // number of codes at each bit length for an optimal tree
  short[] bl_count = new short[MAX_BITS + 1];

  // next code value for each bit length within gen_codes()
  short[] next_code = new short[MAX_BITS + 1];

  // heap used to build the Huffman trees
  int[] heap = new int[2 * L_CODES + 1];

  // number of elements in the heap
  int heap_len;

  // element of largest frequency
  int heap_max;

  // Depth of each subtree used as tie breaker for trees of equal frequency
  byte[] depth = new byte[2 * L_CODES + 1];

  // index for literals or lengths */
  byte[] l_buf;

  // Size of match buffer for literals/lengths.  There are 4 reasons for
  // limiting lit_bufsize to 64K:
  //   - frequencies can be kept in 16 bit counters
  //   - if compression is not successful for the first block, all input
  //     data is still in the window so we can still emit a stored block even
  //     when input comes from standard input.  (This can also be done for
  //     all blocks if lit_bufsize is not greater than 32K.)
  //   - if compression is not successful for a file smaller than 64K, we can
  //     even emit a stored file instead of a stored block (saving 5 bytes).
  //     This is applicable only for zip (not gzip or zlib).
  //   - creating new Huffman trees less frequently may not provide fast
  //     adaptation to changes in the input data statistics. (Take for
  //     example a binary file with poorly compressible code followed by
  //     a highly compressible string table.) Smaller buffer sizes give
  //     fast adaptation but have of course the overhead of transmitting
  //     trees more frequently.
  //   - I can't count above 4
  int lit_bufsize;

  // running index in l_buf
  int last_lit;

  // Buffer for distances. To simplify the code, d_buf and l_buf have
  // the same number of elements. To use different lengths, an extra flag
  // array would be necessary.
  int d_buf;

  // bit length of current block with optimal trees
  int opt_len;

  // bit length of current block with static trees
  int static_len;

  // number of string matches in current block
  int matches;

  // bytes at end of window left to insert
  int insert;

  // Output buffer. bits are inserted starting at the bottom (least
  // significant bits).
  short bi_buf;

  // Number of valid bits in bi_buf.  All bits above the last valid bit
  // are always zero.
  int bi_valid;

  public Deflate(Encoder<?, O> input, int wrap, int level, int windowBits, int memLevel, int strategy) {
    this.input = input;
    l_desc = new Tree();
    d_desc = new Tree();
    bl_desc = new Tree();
    deflateInit(wrap, level, windowBits, memLevel, strategy);
  }

  public Deflate(Encoder<?, O> input, int wrap, int level, int windowBits, int memlevel) {
    this(input, wrap, level, windowBits, memlevel, Z_DEFAULT_STRATEGY);
  }

  public Deflate(Encoder<?, O> input, int wrap, int level, int windowBits) {
    this(input, wrap, level, windowBits, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }

  public Deflate(Encoder<?, O> input, int wrap, int level) {
    this(input, wrap, level, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }

  public Deflate(Encoder<?, O> input, int wrap) {
    this(input, wrap, Z_DEFAULT_COMPRESSION, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }

  public Deflate(Encoder<?, O> input) {
    this(input, Z_NO_WRAP, Z_DEFAULT_COMPRESSION, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }

  public Deflate(int wrap, int level, int windowBits, int memLevel, int strategy) {
    this(null, wrap, level, windowBits, memLevel, strategy);
  }

  public Deflate(int wrap, int level, int windowBits, int memlevel) {
    this(null, wrap, level, windowBits, memlevel, Z_DEFAULT_STRATEGY);
  }

  public Deflate(int wrap, int level, int windowBits) {
    this(null, wrap, level, windowBits, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }

  public Deflate(int wrap, int level) {
    this(null, wrap, level, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }

  public Deflate(int wrap) {
    this(null, wrap, Z_DEFAULT_COMPRESSION, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }

  public Deflate() {
    this(null, Z_NO_WRAP, Z_DEFAULT_COMPRESSION, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }

  Deflate(Deflate<O> from) {
    input = from.input;
    flush = from.flush;
    total_in = from.total_in;
    next_out = from.next_out;
    next_out_index = from.next_out_index;
    avail_out = from.avail_out;
    total_out = from.total_out;
    data_type = from.data_type;
    adler = from.adler;
    status = from.status;
    pending_buf = pending_buf;
    //pending_buf_size = from.pending_buf_size;
    pending_out = from.pending_out;
    pending = from.pending;
    wrap = from.wrap;
    if (gzhead != null) {
      gzhead = from.gzhead.clone();
    }
    gzindex = from.gzindex;
    //method = from.method;
    last_flush = from.last_flush;
    w_size = from.w_size;
    w_bits = from.w_bits;
    w_mask = from.w_mask;
    if (from.window != null) {
      window = new byte[from.window.length];
      System.arraycopy(from.window, 0, window, 0, window.length);
      window_buffer = Binary.outputBuffer(window);
    }
    window_size = from.window_size;
    if (from.prev != null) {
      prev = new short[from.prev.length];
      System.arraycopy(from.prev, 0, prev, 0, prev.length);
    }
    if (from.head != null) {
      head = new short[from.head.length];
      System.arraycopy(from.head, 0, head, 0, head.length);
    }
    ins_h = from.ins_h;
    hash_size = from.hash_size;
    hash_bits = from.hash_bits;
    hash_mask = from.hash_mask;
    hash_shift = from.hash_shift;
    block_start = from.block_start;
    match_length = from.match_length;
    prev_match = from.prev_match;
    match_available = from.match_available;
    strstart = from.strstart;
    match_start = from.match_start;
    lookahead = from.lookahead;
    prev_length = from.prev_length;
    max_chain_length = from.max_chain_length;
    max_lazy_match = from.max_lazy_match;
    level = from.level;
    strategy = from.strategy;
    good_match = from.good_match;
    nice_match = from.nice_match;
    System.arraycopy(from.dyn_ltree, 0, dyn_ltree, 0, dyn_ltree.length);
    System.arraycopy(from.dyn_dtree, 0, dyn_dtree, 0, dyn_dtree.length);
    System.arraycopy(from.bl_tree, 0, bl_tree, 0, bl_tree.length);
    l_desc = from.l_desc.clone();
    d_desc = from.d_desc.clone();
    bl_desc = from.bl_desc.clone();
    System.arraycopy(from.bl_count, 0, bl_count, 0, bl_count.length);
    System.arraycopy(from.next_code, 0, next_code, 0, next_code.length);
    System.arraycopy(from.heap, 0, heap, 0, heap.length);
    heap_len = from.heap_len;
    heap_max = from.heap_max;
    System.arraycopy(from.depth, 0, depth, 0, depth.length);
    if (from.l_buf != null) {
      l_buf = new byte[from.l_buf.length];
      System.arraycopy(from.l_buf, 0, l_buf, 0, l_buf.length);
    }
    lit_bufsize = from.lit_bufsize;
    last_lit = from.last_lit;
    d_buf = from.d_buf;
    opt_len = from.opt_len;
    static_len = from.static_len;
    matches = from.matches;
    insert = from.insert;
    bi_buf = from.bi_buf;
    bi_valid = from.bi_valid;
  }

  protected void deflateInit(int wrap, int level, int windowBits, int memLevel, int strategy) {
    if (level == Z_DEFAULT_COMPRESSION) {
      level = 6;
    }

    if (flush < 0 || flush > Z_BLOCK ||
        memLevel < 1 || memLevel > MAX_MEM_LEVEL ||
        windowBits < 8 || windowBits > 15 ||
        level < 0 || level > 9 ||
        strategy < 0 || strategy > Z_FIXED) {
      throw new DeflateException(Z_STREAM_ERROR);
    }
    if (windowBits == 8) {
      windowBits = 9; // until 256-byte window bug fixed
    }

    this.wrap = wrap;
    gzhead = null;
    w_bits = windowBits;
    w_size = 1 << w_bits;
    w_mask = w_size - 1;

    hash_bits = memLevel + 7;
    hash_size = 1 << hash_bits;
    hash_mask = hash_size - 1;
    hash_shift = (hash_bits + MIN_MATCH - 1) / MIN_MATCH;

    window = new byte[w_size * 2];
    window_buffer = Binary.outputBuffer(window);
    prev = new short[w_size];
    head = new short[hash_size];

    lit_bufsize = 1 << (memLevel + 6); // 16K elements by default

    // We overlay pending_buf and d_buf+l_buf. This works since the average
    // output size for (length,distance) codes is <= 24 bits.
    pending_buf = new byte[lit_bufsize * 3];
    //pending_buf_size = lit_bufsize * 3;

    d_buf = lit_bufsize;
    l_buf = new byte[lit_bufsize];

    this.level = level;
    this.strategy = strategy;

    deflateReset();
  }

  public void deflateResetKeep() {
    total_in = total_out = 0L;
    data_type = Z_UNKNOWN;

    pending = 0;
    pending_out = 0;

    if (wrap < 0) {
      wrap = -wrap; // was made negative by deflate(..., Z_FINISH)
    }
    status = wrap != 0 ? INIT_STATE : BUSY_STATE;
    if (wrap == 1) {
      adler = adler32(0, null, 0, 0);
    } else if (wrap == 2) {
      adler = crc32(0, null, 0, 0);
    } else {
      adler = 0;
    }
    last_flush = Z_NO_FLUSH;

    tr_init();
  }

  public void deflateReset() {
    deflateResetKeep();
    lm_init();
  }

  public void deflateParams(int level, int strategy) {
    if (level == Z_DEFAULT_COMPRESSION) {
      level = 6;
    }
    if (level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
      throw new DeflateException(Z_STREAM_ERROR);
    }

    if (strategy != this.strategy &&
        configuration_table[this.level].func != configuration_table[level].func &&
        total_in != 0) {
      // Flush the last buffer:
      try {
        deflate(Z_PARTIAL_FLUSH);
      } catch (DeflateException e) {
        if (e.code() != Z_BUF_ERROR || pending != 0) {
          throw e;
        }
      }
    }
    if (this.level != level) {
      this.level = level;
      max_lazy_match = configuration_table[level].max_lazy;
      good_match = configuration_table[level].good_length;
      nice_match = configuration_table[level].nice_length;
      max_chain_length = configuration_table[level].max_chain;
    }
    this.strategy = strategy;
  }

  @Override
  public Deflate<O> clone() {
    return new Deflate<O>(this);
  }

  // Set the current flush mode.
  public Deflate<O> flush(int flush) {
    if (flush < 0 || flush > Z_BLOCK) {
      throw new DeflateException(Z_STREAM_ERROR);
    }
    this.flush = flush;
    return this;
  }

  // Flush as much pending output as possible. All deflate() output goes
  // through this function so some applications may wish to modify it
  // to avoid allocating a large strm->next_out buffer and copying into it.
  // (See also read_buf()).
  protected void flush_pending() {
    tr_flush_bits();
    int len = pending;
    if (len > avail_out) {
      len = avail_out;
    }
    if (len == 0) {
      return;
    }

    System.arraycopy(pending_buf, pending_out, next_out, next_out_index, len);
    next_out_index += len;
    pending_out += len;
    total_out += len;
    avail_out -= len;
    pending -= len;
    if (pending == 0) {
      pending_out = 0;
    }
  }

  @Override
  public Deflate<O> feed(Encoder<?, O> input) {
    this.input = input;
    return this;
  }

  @Override
  public Encoder<Encoder<?, O>, O> pull(OutputBuffer<?> output) {
    next_out = output.array();
    next_out_index = output.arrayOffset() + output.index();
    avail_out = output.remaining();

    try {
      final boolean needsMore = deflate(flush);
      output.index(next_out_index - output.arrayOffset());

      if (input.isDone() && !needsMore) {
        return input.asDone();
      } else if (input.isError()) {
        return input.asError();
      } else if (output.isDone()) {
        return error(new EncoderException("truncated"));
      } else if (output.isError()) {
        return error(output.trap());
      } else {
        return this;
      }
    } catch (DeflateException cause) {
      return error(cause);
    } finally {
      next_out = null;
      next_out_index = 0;
      avail_out = 0;
    }
  }

  public boolean deflate(int flush) {
    int old_flush; // value of flush param for previous deflate call

    if (flush > Z_BLOCK || flush < 0) {
      throw new DeflateException(Z_STREAM_ERROR);
    }

    if (next_out == null ||
       //(next_in == null && avail_in != 0) ||
       (status == FINISH_STATE && flush != Z_FINISH)) {
      throw new DeflateException(Z_STREAM_ERROR);
    }
    if (avail_out == 0) {
      throw new DeflateException(Z_BUF_ERROR);
    }

    old_flush = last_flush;
    last_flush = flush;

    // Write the header
    if (status == INIT_STATE) {
      if (wrap == 2) {
        adler = crc32(0, null, 0, 0);
        put_byte(31);
        put_byte(139);
        put_byte(8);
        if (gzhead == null) {
          put_byte(0);
          put_byte(0);
          put_byte(0);
          put_byte(0);
          put_byte(0);
          put_byte(level == 9 ? 2 : strategy >= Z_HUFFMAN_ONLY || level < 2 ? 4 : 0);
          put_byte(OS_CODE);
          status = BUSY_STATE;
        } else {
          put_byte((gzhead.text ? 1 : 0) +
                   (gzhead.hcrc ? 2 : 0) +
                   (gzhead.extra == null ? 0 : 4) +
                   (gzhead.name == null ? 0 : 8) +
                   (gzhead.comment == null ? 0 : 16));
          put_byte(gzhead.time);
          put_byte(gzhead.time >> 8);
          put_byte(gzhead.time >> 16);
          put_byte(gzhead.time >> 24);
          put_byte(level == 9 ? 2 : strategy >= Z_HUFFMAN_ONLY || level < 2 ? 4 : 0);
          put_byte(gzhead.os);
          if (gzhead.extra != null) {
            put_byte(gzhead.extra_len);
            put_byte(gzhead.extra_len >> 8);
          }
          if (gzhead.hcrc) {
            adler = crc32(adler, pending_buf, pending_out, pending);
          }
          gzindex = 0;
          status = EXTRA_STATE;
        }
      } else {
        int header = (Z_DEFLATED + ((w_bits - 8) << 4)) << 8;
        int level_flags;

        if (strategy >= Z_HUFFMAN_ONLY || level < 2) {
          level_flags = 0;
        } else if (level < 6) {
          level_flags = 1;
        } else if (level == 6) {
          level_flags = 2;
        } else {
          level_flags = 3;
        }
        header |= level_flags << 6;
        if (strstart != 0) {
          header |= PRESET_DICT;
        }
        header += 31 - (header % 31);

        status = BUSY_STATE;
        putShortMSB(header);

        // Save the adler32 of the preset dictionary:
        if (strstart != 0) {
          putShortMSB(adler >>> 16);
          putShortMSB(adler & 0xFFFF);
        }
        adler = adler32(0, null, 0, 0);
      }
    }
    if (status == EXTRA_STATE) {
      if (gzhead.extra != null) {
        int beg = pending; // start of bytes to update crc

        while (gzindex < (gzhead.extra_len & 0xFFFF)) {
          if (pending == pending_buf.length) {
            if (gzhead.hcrc && pending > beg) {
              adler = crc32(adler, pending_buf, beg, pending - beg);
            }
            flush_pending();
            beg = pending;
            if (pending == pending_buf.length) {
              break;
            }
          }
          put_byte(gzhead.extra[gzindex]);
          gzindex++;
        }
        if (gzhead.hcrc && pending > beg) {
          adler = crc32(adler, pending_buf, beg, pending - beg);
        }
        if (gzindex == gzhead.extra_len) {
          gzindex = 0;
          status = NAME_STATE;
        }
      } else {
        status = NAME_STATE;
      }
    }
    if (status == NAME_STATE) {
      if (gzhead.name != null) {
        int beg = pending; // start of bytes to update crc
        int val;

        do {
          if (pending == pending_buf.length) {
            if (gzhead.hcrc && pending > beg) {
              adler = crc32(adler, pending_buf, beg, pending - beg);
            }
            flush_pending();
            beg = pending;
            if (pending == pending_buf.length) {
              val = 1;
              break;
            }
          }
          val = gzhead.name[gzindex++];
          put_byte(val);
        } while (val != 0);
        if (gzhead.hcrc && pending > beg) {
          adler = crc32(adler, pending_buf, beg, pending - beg);
        }
        if (val == 0) {
          gzindex = 0;
          status = COMMENT_STATE;
        }
      } else {
        status = COMMENT_STATE;
      }
    }
    if (status == COMMENT_STATE) {
      if (gzhead.comment != null) {
        int beg = pending; // start of bytes to update crc
        int val;

        do {
          if (pending == pending_buf.length) {
            if (gzhead.hcrc && pending > beg) {
              adler = crc32(adler, pending_buf, beg, pending - beg);
            }
            flush_pending();
            beg = pending;
            if (pending == pending_buf.length) {
              val = 1;
              break;
            }
          }
          val = gzhead.comment[gzindex++];
          put_byte(val);
        } while (val != 0);
        if (gzhead.hcrc && pending > beg) {
          adler = crc32(adler, pending_buf, beg, pending - beg);
        }
        if (val == 0) {
          status = HCRC_STATE;
        }
      } else {
        status = HCRC_STATE;
      }
    }
    if (status == HCRC_STATE) {
      if (gzhead.hcrc) {
        if (pending + 2 > pending_buf.length) {
          flush_pending();
        }
        if (pending + 2 <= pending_buf.length) {
          put_byte(adler);
          put_byte(adler >>> 8);
          adler = crc32(0, null, 0, 0);
          status = BUSY_STATE;
        }
      } else {
        status = BUSY_STATE;
      }
    }

    // Flush as much pending output as possible
    if (pending != 0) {
      flush_pending();
      if (avail_out == 0) {
        // Since avail_out is 0, deflate will be called again with
        // more output space, but possibly with both pending and
        // avail_in equal to zero. There won't be anything to do,
        // but this is not an error situation so make sure we
        // return OK instead of BUF_ERROR at next call of deflate:
        last_flush = -1;
        return true;
      }

      // Make sure there is something to do and avoid duplicate consecutive
      // flushes. For repeated and useless calls with Z_FINISH, we keep
      // returning Z_STREAM_END instead of Z_BUF_ERROR.
    } else if (input.isDone() && flush <= old_flush && flush != Z_FINISH) {
      throw new DeflateException(Z_BUF_ERROR);
    }

    // User must not provide more input after the first FINISH:
    if (status == FINISH_STATE && !input.isDone()) {
      throw new DeflateException(Z_BUF_ERROR);
    }

    // Start a new block or continue the current one.
    if (!input.isDone() || lookahead != 0 || (flush != Z_NO_FLUSH && status != FINISH_STATE)) {
      int bstate;
      switch (configuration_table[level].func) {
      case STORED:
        bstate = deflate_stored(flush);
        break;
      case FAST:
        bstate = deflate_fast(flush);
        break;
      case SLOW:
        bstate = deflate_slow(flush);
        break;
      default:
        bstate = -1;
      }

      if (bstate == FINISH_STARTED || bstate == FINISH_DONE) {
        status = FINISH_STATE;
      }
      if (bstate == NEED_MORE || bstate == FINISH_STARTED) {
        if (avail_out == 0) {
          last_flush = -1; // avoid BUF_ERROR next call, see above
        }
        return true;
        // If flush != Z_NO_FLUSH && avail_out == 0, the next call
        // of deflate should use the same flush parameter to make sure
        // that the flush is complete. So we don't have to output an
        // empty block here, this will be done at next call. This also
        // ensures that for a very small output buffer, we emit at most
        // one empty block.
      }
      if (bstate == BLOCK_DONE) {
        if (flush == Z_PARTIAL_FLUSH) {
          tr_align();
        } else if (flush != Z_BLOCK) { // FULL_FLUSH or SYNC_FLUSH
          tr_stored_block(0, 0, false);
          // For a full flush, this empty block will be recognized
          // as a special marker by inflate_sync().
          if (flush == Z_FULL_FLUSH) {
            for (int i = 0; i < hash_size; i += 1) { // forget history
              head[i] = 0;
            }
            if (lookahead == 0) {
              strstart = 0;
              block_start = 0;
              insert = 0;
            }
          }
        }
        flush_pending();
        if (avail_out == 0) {
          last_flush = -1; // avoid BUF_ERROR at next call, see above
          return false;
        }
      }
    }
    assert avail_out > 0 : "bug2";

    if (wrap <= 0) {
      return false;
    }
    if (flush != Z_FINISH) {
      return true;
    }

    // Write the trailer
    if (wrap == 2) {
      put_byte(adler);
      put_byte(adler >>> 8);
      put_byte(adler >>> 16);
      put_byte(adler >>> 24);
      put_byte((int)total_in);
      put_byte((int)total_in >>> 8);
      put_byte((int)total_in >>> 16);
      put_byte((int)total_in >>> 24);
    } else {
      putShortMSB(adler >>> 16);
      putShortMSB(adler & 0xFFFF);
    }
    flush_pending();
    // If avail_out is zero, the application will call deflate again
    // to flush the rest.
    if (wrap > 0) {
      wrap = -wrap; // write the trailer only once!
    }
    return false;
  }

  protected void deflateEnd() {
    if (status != INIT_STATE && status != BUSY_STATE && status != FINISH_STATE) {
      throw new DeflateException(Z_STREAM_ERROR);
    }

    // Deallocate in reverse order of allocations:
    pending_buf = null;
    l_buf = null;
    head = null;
    prev = null;
    window = null;
    window_buffer = null;

    if (status == BUSY_STATE) {
      throw new DeflateException(Z_DATA_ERROR);
    }
  }

  // Read a new buffer from the current input stream, update the adler32
  // and total number of bytes read.  All deflate() input goes through
  // this function so some applications may wish to modify it to avoid
  // allocating a large strm->next_in buffer and copying from it.
  // (See also flush_pending()).
  protected int read_buf(byte[] buf, int start, int size) {
    window_buffer.index(start).limit(start + size).isPart(true);
    input = input.pull(window_buffer);

    int len = window_buffer.index() - start;
    if (len == 0) {
      return 0;
    }

    if (wrap == 1) {
      adler = adler32(adler, buf, start, len);
    } else if (wrap == 2) {
      adler = crc32(adler, buf, start, len);
    }
    total_in += len;

    return len;
  }

  // Initialize the "longest match" routines for a new zlib stream
  final void lm_init() {
    window_size = 2 * w_size;

    for (int i = 0; i < hash_size; i += 1) {
      head[i] = 0;
    }

    // Set the default configuration parameters:
    max_lazy_match = configuration_table[level].max_lazy;
    good_match = configuration_table[level].good_length;
    nice_match = configuration_table[level].nice_length;
    max_chain_length = configuration_table[level].max_chain;

    strstart = 0;
    block_start = 0;
    lookahead = 0;
    match_length = prev_length = MIN_MATCH - 1;
    match_available = 0;
    ins_h = 0;
  }

  // Set match_start to the longest match starting at the given string and
  // return its length. Matches shorter or equal to prev_length are discarded,
  // in which case the result is equal to prev_length and match_start is
  // garbage.
  // IN assertions: cur_match is the head of the hash chain for the current
  //   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
  // OUT assertion: the match length is not greater than s->lookahead.
  final int longest_match(int cur_match) {
    int chain_length = max_chain_length; // max hash chain length
    int scan = strstart; // current string
    int match; // matched string
    int len; // length of current match
    int best_len = prev_length; // best match length so far
    int nice_match = this.nice_match; // stop if match long enough
    final int limit = strstart > w_size - MIN_LOOKAHEAD ? strstart - (w_size - MIN_LOOKAHEAD) : 0;
    // Stop when cur_match becomes <= limit. To simplify the code,
    // we prevent matches with the string of window index 0.

    final int strend = strstart + MAX_MATCH;
    byte scan_end1 = window[scan + best_len - 1];
    byte scan_end = window[scan + best_len];

    // The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
    // It is easy to get rid of this optimization if necessary.
    assert hash_bits >= 8 && MAX_MATCH == 258 : "Code too clever";

    // Do not waste too much time if we already have a good match:
    if (prev_length >= good_match) {
      chain_length >>>= 2;
    }
    // Do not look for matches beyond the end of the input. This is necessary
    // to make deflate deterministic.
    if (nice_match > lookahead) {
      nice_match = lookahead;
    }

    assert strstart <= window_size - MIN_LOOKAHEAD : "need lookahead";

    do {
      assert cur_match < strstart : "no future";
      match = cur_match;

      // Skip to next match if the match length cannot increase
      // or if the match length is less than 2.
      if (window[match + best_len] != scan_end  ||
          window[match + best_len - 1] != scan_end1 ||
          window[match] != window[scan] ||
          window[++match] != window[scan + 1]) {
        continue;
      }

      // The check at best_len-1 can be removed because it will be made
      // again later. (This heuristic is not always a win.)
      // It is not necessary to compare scan[2] and match[2] since they
      // are always equal when the other bytes match, given that
      // the hash keys are equal and that HASH_BITS >= 8.
      scan += 2;
      match++;
      assert window[scan] == window[match] : "match[2]?";

      // We check for insufficient lookahead only every 8th comparison;
      // the 256th check will be made at strstart+258.
      do {
      } while (window[++scan] == window[++match] &&
               window[++scan] == window[++match] &&
               window[++scan] == window[++match] &&
               window[++scan] == window[++match] &&
               window[++scan] == window[++match] &&
               window[++scan] == window[++match] &&
               window[++scan] == window[++match] &&
               window[++scan] == window[++match] &&
               scan < strend);

      assert scan <= window_size - 1 : "wild scan";

      len = MAX_MATCH - (strend - scan);
      scan = strend - MAX_MATCH;

      if (len > best_len) {
        match_start = cur_match;
        best_len = len;
        if (len >= nice_match) {
          break;
        }
        scan_end1 = window[scan + best_len - 1];
        scan_end = window[scan + best_len];
      }
    } while ((cur_match = (prev[cur_match & w_mask] & 0xFFFF)) > limit && --chain_length != 0);

    if (best_len <= lookahead) {
      return best_len;
    }
    return lookahead;
  }

  // Fill the window when the lookahead becomes insufficient.
  // Updates strstart and lookahead.
  //
  // IN assertion: lookahead < MIN_LOOKAHEAD
  // OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
  //    At least one byte has been read, or avail_in == 0; reads are
  //    performed for at least two bytes (required for the zip translate_eol
  //    option -- not supported here).
  protected void fill_window() {
    int n, m;
    int p;
    int more; // Amount of free space at the end of the window.

    assert lookahead < MIN_LOOKAHEAD : "already enough lookahead";

    do {
      more = window_size - lookahead - strstart;

      // If the window is almost full and there is insufficient lookahead,
      // move the upper half to the lower one to make room in the upper half.
      if (strstart >= w_size + (w_size - MIN_LOOKAHEAD)) {
        System.arraycopy(window, w_size, window, 0, w_size);
        match_start -= w_size;
        strstart -= w_size; // we now have strstart >= MAX_DIST
        block_start -= w_size;

        // Slide the hash table (could be avoided with 32 bit values
        // at the expense of memory usage). We slide even when level == 0
        // to keep the hash table consistent if we switch back to level > 0
        // later. (Using level 0 permanently is not an optimal usage of
        // zlib, so we don't care about this pathological case.)
        n = hash_size;
        p = n;
        do {
          m = head[--p] & 0xFFFF;
          head[p] = m >= w_size ? (short)(m - w_size) : 0;
        } while (--n != 0);

        n = w_size;
        p = n;
        do {
          m = prev[--p] & 0xFFFF;
          prev[p] = m >= w_size ? (short)( m - w_size) : 0;
          // If n is not on any hash chain, prev[n] is garbage but
          // its value will never be used.
        }
        while (--n != 0);
        more += w_size;
      }
      if (input.isDone()) {
        break;
      }

      // If there was no sliding:
      //    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
      //    more == window_size - lookahead - strstart
      // => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
      // => more >= window_size - 2*WSIZE + 2
      // In the BIG_MEM or MMAP case (not yet supported),
      //   window_size == input_size + MIN_LOOKAHEAD  &&
      //   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
      // Otherwise, window_size == 2*WSIZE so more >= 2.
      // If there was sliding, more >= WSIZE. So in all cases, more >= 2.
      assert more >= 2 : "more < 2";

      n = read_buf(window, strstart + lookahead, more);
      if (n == 0) {
        break;
      }
      lookahead += n;

      // Initialize the hash value now that we have some input:
      if (lookahead + insert >= MIN_MATCH) {
        int str = strstart - insert;
        ins_h = window[str] & 0xFF;
        ins_h = ((ins_h << hash_shift) ^ (window[str + 1] & 0xFF)) & hash_mask;
        while (insert != 0) {
          ins_h = ((ins_h << hash_shift) ^ (window[str + (MIN_MATCH - 1)] & 0xFF)) & hash_mask;
          prev[str & w_mask] = head[ins_h];
          head[ins_h] = (short)str;
          str++;
          insert--;
          if (lookahead + insert < MIN_MATCH) {
            break;
          }
        }
      }
      // If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
      // but this is not important since only literal bytes will be emitted.
    } while (lookahead < MIN_LOOKAHEAD && !input.isDone());

    assert strstart <= window_size - MIN_LOOKAHEAD : "not enough room for search";
  }

  // Flush the current block, with given end-of-file flag.
  // IN assertion: strstart is set to the end of the current match.
  final void flush_block_only(boolean eof) {
    tr_flush_block(block_start >= 0 ? block_start : -1, strstart - block_start, eof);
    block_start = strstart;
    flush_pending();
  }

  // Copy without compression as much as possible from the input stream, return
  // the current block state.
  // This function does not insert new strings in the dictionary since
  // uncompressible data is probably not useful. This function is used
  // only for the level=0 compression option.
  // NOTE: this function should be optimized to avoid extra copying from
  // window to pending_buf.
  protected int deflate_stored(int flush) {
    // Stored blocks are limited to 0xffff bytes, pending_buf is limited
    // to pending_buf_size, and each stored block has a 5 byte header:
    int max_block_size = 0xFFFF;
    int max_start;

    if (max_block_size > pending_buf.length - 5) {
      max_block_size = pending_buf.length - 5;
    }

    // Copy as much as possible from input to output:
    while (true) {
      // Fill the window as much as possible:
      if (lookahead <= 1) {
        assert strstart < w_size + (w_size - MIN_LOOKAHEAD) || block_start >= w_size : "slide too late";

        fill_window();
        if (lookahead == 0 && flush == Z_NO_FLUSH) {
          return NEED_MORE;
        }

        if (lookahead == 0) {
          break; // flush the current block
        }
      }
      assert block_start >= 0 : "block gone";

      strstart += lookahead;
      lookahead = 0;

      // Emit a stored block if pending_buf will be full:
      max_start = block_start + max_block_size;
      if (strstart == 0 || strstart >= max_start) {
        // strstart == 0 is possible when wraparound on 16-bit machine
        lookahead = strstart - max_start;
        strstart = max_start;
        flush_block_only(false);
        if (avail_out == 0) {
          return NEED_MORE;
        }
      }
      // Flush if we may have to slide, otherwise block_start may become
      // negative and the data will be gone:
      if (strstart - block_start >= w_size - MIN_LOOKAHEAD) {
        flush_block_only(false);
        if (avail_out == 0) {
          return NEED_MORE;
        }
      }
    }
    insert = 0;
    if (flush == Z_FINISH) {
      flush_block_only(true);
      if (avail_out == 0) {
        return NEED_MORE;
      }
      return FINISH_DONE;
    }
    if (strstart > block_start) {
      flush_block_only(false);
      if (avail_out == 0) {
        return NEED_MORE;
      }
    }
    return BLOCK_DONE;
  }

  // Compress as much as possible from the input stream, return the current
  // block state.
  // This function does not perform lazy evaluation of matches and inserts
  // new strings in the dictionary only for unmatched strings or for short
  // matches. It is used only for the fast compression options.
  protected int deflate_fast(int flush) {
    int hash_head; // head of the hash chain
    boolean bflush; // set if current block must be flushed

    while (true) {
      // Make sure that we always have enough lookahead, except
      // at the end of the input file. We need MAX_MATCH bytes
      // for the next match, plus MIN_MATCH bytes to insert the
      // string following the next match.
      if (lookahead < MIN_LOOKAHEAD) {
        fill_window();
        if (lookahead < MIN_LOOKAHEAD && flush == Z_NO_FLUSH) {
          return NEED_MORE;
        }
        if (lookahead == 0) {
          break; // flush the current block
        }
      }

      // Insert the string window[strstart .. strstart+2] in the
      // dictionary, and set hash_head to the head of the hash chain:
      hash_head = 0;
      if (lookahead >= MIN_MATCH) {
        ins_h = ((ins_h << hash_shift) ^ (window[strstart + (MIN_MATCH - 1)] & 0xFF)) & hash_mask;
        prev[strstart & w_mask] = head[ins_h];
        hash_head = head[ins_h] & 0xFFFF;
        head[ins_h] = (short)strstart;
      }

      // Find the longest match, discarding those <= prev_length.
      // At this point we have always match_length < MIN_MATCH
      if (hash_head != 0 && ((strstart - hash_head) & 0xFFFF) <= w_size - MIN_LOOKAHEAD) {
        // To simplify the code, we prevent matches with the string
        // of window index 0 (in particular we have to avoid a match
        // of the string with itself at the start of the input file).
        match_length = longest_match(hash_head);
      }
      if (match_length >= MIN_MATCH) {
        //check_match(strstart, match_start, match_length);
        bflush = tr_tally(strstart - match_start, match_length - MIN_MATCH);
        lookahead -= match_length;

        // Insert new strings in the hash table only if the match length
        // is not too large. This saves time but degrades compression.
        if (match_length <= max_lazy_match && lookahead >= MIN_MATCH) {
          match_length--; // string at strstart already in table
          do {
            strstart++;
            ins_h = ((ins_h << hash_shift) ^ (window[strstart + (MIN_MATCH - 1)] & 0xFF)) & hash_mask;
            prev[strstart & w_mask] = head[ins_h];
            hash_head = head[ins_h] & 0xFFFF;
            head[ins_h] = (short)strstart;
            // strstart never exceeds WSIZE-MAX_MATCH, so there are
            // always MIN_MATCH bytes ahead.
          } while (--match_length != 0);
          strstart++;
        } else {
          strstart += match_length;
          match_length = 0;
          ins_h = window[strstart] & 0xFF;
          ins_h = ((ins_h << hash_shift) ^ (window[strstart + 1] & 0xFF)) & hash_mask;
          // If lookahead < MIN_MATCH, ins_h is garbage, but it does not
          // matter since it will be recomputed at next deflate call.
        }
      } else {
        // No match, output a literal byte
        bflush = tr_tally(0, window[strstart] & 0xFF);
        lookahead--;
        strstart++;
      }
      if (bflush) {
        flush_block_only(false);
        if (avail_out == 0) {
          return NEED_MORE;
        }
      }
    }
    insert = strstart < MIN_MATCH - 1 ? strstart : MIN_MATCH - 1;
    if (flush == Z_FINISH) {
      flush_block_only(true);
      if (avail_out == 0) {
        return NEED_MORE;
      }
      return FINISH_DONE;
    }
    if (last_lit != 0) {
      flush_block_only(false);
      if (avail_out == 0) {
        return NEED_MORE;
      }
    }
    return BLOCK_DONE;
  }

  // Same as above, but achieves better compression. We use a lazy
  // evaluation for matches: a match is finally adopted only if there is
  // no better match at the next window position.
  protected int deflate_slow(int flush) {
    int hash_head; // head of hash chain
    boolean bflush; // set if current block must be flushed

    // Process the input block.
    while (true) {
      // Make sure that we always have enough lookahead, except
      // at the end of the input file. We need MAX_MATCH bytes
      // for the next match, plus MIN_MATCH bytes to insert the
      // string following the next match.

      if (lookahead < MIN_LOOKAHEAD) {
        fill_window();
        if (lookahead < MIN_LOOKAHEAD && flush == Z_NO_FLUSH) {
          return NEED_MORE;
        }
        if (lookahead == 0) {
          break; // flush the current block
        }
      }

      // Insert the string window[strstart .. strstart+2] in the
      // dictionary, and set hash_head to the head of the hash chain:
      hash_head = 0;
      if (lookahead >= MIN_MATCH) {
        ins_h = ((ins_h << hash_shift) ^ (window[strstart + (MIN_MATCH - 1)] & 0xFF)) & hash_mask;
        prev[strstart & w_mask] = head[ins_h];
        hash_head = head[ins_h] & 0xFFFF;
        head[ins_h] = (short)strstart;
      }

      // Find the longest match, discarding those <= prev_length.
      prev_length = match_length;
      prev_match = match_start;
      match_length = MIN_MATCH - 1;

      if (hash_head != 0 && prev_length < max_lazy_match &&
         ((strstart - hash_head) & 0xFFFF) <= w_size - MIN_LOOKAHEAD) {
        // To simplify the code, we prevent matches with the string
        // of window index 0 (in particular we have to avoid a match
        // of the string with itself at the start of the input file).
        match_length = longest_match(hash_head);
        // longest_match() sets match_start

        if (match_length <= 5 && (strategy == Z_FILTERED ||
           (match_length == MIN_MATCH && strstart - match_start > TOO_FAR))) {
          // If prev_match is also MIN_MATCH, match_start is garbage
          // but we will ignore the current match anyway.
          match_length = MIN_MATCH - 1;
        }
      }

      // If there was a match at the previous step and the current
      // match is not better, output the previous match:
      if (prev_length >= MIN_MATCH && match_length <= prev_length) {
        int max_insert = strstart + lookahead - MIN_MATCH;
        // Do not insert strings in hash table beyond this.

        //check_match(strstart - 1, prev_match, prev_length);

        bflush = tr_tally(strstart - 1 - prev_match, prev_length - MIN_MATCH);

        // Insert in hash table all strings up to the end of the match.
        // strstart-1 and strstart are already inserted. If there is not
        // enough lookahead, the last two strings are not inserted in
        // the hash table.
        lookahead -= prev_length - 1;
        prev_length -= 2;
        do{
          if (++strstart <= max_insert) {
            ins_h = ((ins_h << hash_shift) ^ (window[strstart + (MIN_MATCH - 1)] & 0xFF)) & hash_mask;
            prev[strstart & w_mask] = head[ins_h];
            hash_head = head[ins_h] & 0xFFFF;
            head[ins_h] = (short)strstart;
          }
        } while (--prev_length != 0);
        match_available = 0;
        match_length = MIN_MATCH - 1;
        strstart++;

        if (bflush) {
          flush_block_only(false);
          if (avail_out == 0) {
            return NEED_MORE;
          }
        }
      } else if (match_available != 0) {
        // If there was no match at the previous position, output a
        // single literal. If there was a match but the current match
        // is longer, truncate the previous match to a single literal.
        bflush = tr_tally(0, window[strstart - 1] & 0xFF);
        if (bflush) {
          flush_block_only(false);
        }
        strstart++;
        lookahead--;
        if (avail_out == 0) {
          return NEED_MORE;
        }
      } else {
        // There is no previous match to compare with, wait for
        // the next step to decide.
        match_available = 1;
        strstart++;
        lookahead--;
      }
    }
    assert flush != Z_NO_FLUSH : "no flush?";
    if (match_available != 0) {
      bflush = tr_tally(0, window[strstart - 1] & 0xFF);
      match_available = 0;
    }
    insert = strstart < MIN_MATCH - 1 ? strstart : MIN_MATCH - 1;
    if (flush == Z_FINISH) {
      flush_block_only(true);
      if (avail_out == 0) {
        return NEED_MORE;
      }
      return FINISH_DONE;
    }
    if (last_lit != 0) {
      flush_block_only(false);
      if (avail_out == 0) {
        return NEED_MORE;
      }
    }
    return BLOCK_DONE;
  }

  // For Z_RLE, simply look for runs of bytes, generate matches only of distance
  // one.  Do not maintain a hash table.  (It will be regenerated if this run of
  // deflate switches away from Z_RLE.)
  protected int deflate_rle(int flush) {
    boolean bflush; // set if current block must be flushed
    int prev; // byte at distance one to match
    int scan, strend; // scan goes up to strend for length of run

    while (true) {
      // Make sure that we always have enough lookahead, except
      // at the end of the input file. We need MAX_MATCH bytes
      // for the longest run, plus one for the unrolled loop.
      if (lookahead <= MAX_MATCH) {
        fill_window();
        if (lookahead <= MAX_MATCH && flush == Z_NO_FLUSH) {
          return NEED_MORE;
        }
        if (lookahead == 0) {
          break; // flush the current block
        }
      }

      // See how many times the previous byte repeats
      match_length = 0;
      if (lookahead >= MIN_MATCH && strstart > 0) {
        scan = strstart - 1;
        prev = window[scan] & 0xFF;
        if (prev == (window[++scan] & 0xFF) && prev == (window[++scan] & 0xFF) &&
            prev == (window[++scan] & 0xFF)) {
          strend = strstart + MAX_MATCH;
          do {
          } while (prev == (window[++scan] & 0xFF) && prev == (window[++scan] & 0xFF) &&
                   prev == (window[++scan] & 0xFF) && prev == (window[++scan] & 0xFF) &&
                   prev == (window[++scan] & 0xFF) && prev == (window[++scan] & 0xFF) &&
                   prev == (window[++scan] & 0xFF) && prev == (window[++scan] & 0xFF) &&
                   scan < strend);
          match_length = MAX_MATCH - (strend - scan);
          if (match_length > lookahead) {
            match_length = lookahead;
          }
        }
        assert scan <= window_size - 1 : "wild scan";
      }

      // Emit match if have run of MIN_MATCH or longer, else emit literal
      if (match_length >= MIN_MATCH) {
        //check_match(strstart, strstart - 1, match_length);

        bflush = tr_tally(1, match_length - MIN_MATCH);

        lookahead -= match_length;
        strstart += match_length;
        match_length = 0;
      } else {
        // No match, output a literal byte
        bflush = tr_tally(0, window[strstart] & 0xFF);
        lookahead--;
        strstart++;
      }
      if (bflush) {
        flush_block_only(false);
        if (avail_out == 0) {
          return NEED_MORE;
        }
      }
    }
    insert = 0;
    if (flush == Z_FINISH) {
      flush_block_only(true);
      if (avail_out == 0) {
        return NEED_MORE;
      }
      return FINISH_DONE;
    }
    if (last_lit != 0) {
      flush_block_only(false);
      if (avail_out == 0) {
        return NEED_MORE;
      }
    }
    return BLOCK_DONE;
  }

  // For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
  // (It will be regenerated if this run of deflate switches away from Huffman.)
  protected int deflate_huff(int flush) {
    boolean bflush; // set if current block must be flushed

    while (true) {
      // Make sure that we have a literal to write.
      if (lookahead == 0) {
        fill_window();
        if (lookahead == 0) {
          if (flush == Z_NO_FLUSH) {
            return NEED_MORE;
          }
          break; // flush the current block
        }
      }

      // Output a literal byte
      match_length = 0;
      bflush = tr_tally(0, window[strstart] & 0xFF);
      lookahead--;
      strstart++;
      if (bflush) {
        flush_block_only(false);
        if (avail_out == 0) {
          return NEED_MORE;
        }
      }
    }
    insert = 0;
    if (flush == Z_FINISH) {
      flush_block_only(true);
      if (avail_out == 0) {
        return NEED_MORE;
      }
      return FINISH_DONE;
    }
    if (last_lit != 0) {
      flush_block_only(false);
      if (avail_out == 0) {
        return NEED_MORE;
      }
    }
    return BLOCK_DONE;
  }

  // Send a value on a given number of bits.
  // IN assertion: length <= 16 and value fits in length bits.
  final void send_bits(int value, int length) {
    if (bi_valid > BUF_SIZE - length) {
      bi_buf |= (value << bi_valid) & 0xFFFF;
      put_short(bi_buf);
      bi_buf = (short)(value >>> (BUF_SIZE - bi_valid));
      bi_valid += length - BUF_SIZE;
    } else {
      bi_buf |= (value << bi_valid) & 0xFFFF;
      bi_valid += length;
    }
  }

  // Initialize the tree data structures for a new zlib stream.
  final void tr_init() {
    l_desc.dyn_tree = dyn_ltree;
    l_desc.stat_desc = static_l_desc;

    d_desc.dyn_tree = dyn_dtree;
    d_desc.stat_desc = static_d_desc;

    bl_desc.dyn_tree = bl_tree;
    bl_desc.stat_desc = static_bl_desc;

    bi_buf = 0;
    bi_valid = 0;
    //last_eob_len = 8; // enough lookahead for inflate

    // Initialize the first block of the first file:
    init_block();
  }

  // Initialize a new block.
  final void init_block() {
    int n; // iterates over tree elements

    // Initialize the trees.
    for (n = 0; n < L_CODES; n += 1) {
      dyn_ltree[n * 2] = 0;
    }
    for (n = 0; n < D_CODES; n += 1) {
      dyn_dtree[n * 2] = 0;
    }
    for (n = 0; n < BL_CODES; n += 1) {
      bl_tree[n * 2] = 0;
    }

    dyn_ltree[END_BLOCK * 2] = 1;
    opt_len = static_len = 0;
    last_lit = matches = 0;
  }

  // Compares to subtrees, using the tree depth as tie breaker when
  // the subtrees have equal frequency. This minimizes the worst case length.
  static boolean smaller(short[] tree, int n, int m, byte[] depth) {
    short nFreq = tree[n * 2];
    short mFreq = tree[m * 2];
    return nFreq < mFreq || nFreq == mFreq && depth[n] <= depth[m];
  }

  // Restore the heap property by moving down the tree starting at node k,
  // exchanging a node with the smallest of its two sons if necessary, stopping
  // when the heap property is re-established (each father smaller than its
  // two sons).
  final void pqdownheap(short[] tree, int k) {
    int v = heap[k];
    int j = k << 1; // left son of k
    while (j <= heap_len) {
      // Set j to the smallest of the two sons:
      if (j < heap_len && smaller(tree, heap[j + 1], heap[j], depth)) {
        j++;
      }
      // Exit if v is smaller than both sons
      if (smaller(tree, v, heap[j], depth)) {
        break;
      }

      // Exchange v with the smallest son
      heap[k] = heap[j];
      k = j;

      // And continue down the tree, setting j to the left son of k
      j <<= 1;
    }
    heap[k] = v;
  }

  // Scan a literal or distance tree to determine the frequencies of the codes
  // in the bit length tree.
  final void scan_tree(short[] tree, int max_code) {
    int n; // iterates over all tree elements
    int prevlen = -1; // last emitted length
    int curlen; // length of current code
    int nextlen = tree[0*2+1]; // length of next code
    int count = 0; // repeat count of the current code
    int max_count = 7; // max repeat count
    int min_count = 4; // min repeat count

    if (nextlen == 0) {
      max_count = 138;
      min_count = 3;
    }
    tree[(max_code + 1) * 2 + 1] = (short)0xFFFF; // guard

    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen == nextlen) {
        continue;
      } else if (count < min_count) {
        bl_tree[curlen * 2] += count;
      } else if (curlen != 0) {
        if (curlen != prevlen) {
          bl_tree[curlen * 2]++;
        }
        bl_tree[REP_3_6 * 2]++;
      } else if (count <= 10) {
        bl_tree[REPZ_3_10 * 2]++;
      } else {
        bl_tree[REPZ_11_138 * 2]++;
      }
      count = 0;
      prevlen = curlen;
      if (nextlen == 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen == nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }

  // Send a literal or distance tree in compressed form, using the codes in
  // bl_tree.
  final void send_tree(short[] tree, int max_code) {
    int n; // iterates over all tree elements
    int prevlen = -1; // last emitted length
    int curlen; // length of current code
    int nextlen = tree[0*2+1]; // length of next code
    int count = 0; // repeat count of the current code
    int max_count = 7; // max repeat count
    int min_count = 4; // min repeat count

    // tree[(max_code + 1) * 2 + 1] = -1; // guard already set
    if (nextlen == 0) {
      max_count = 138;
      min_count = 3;
    }

    for (n = 0; n <= max_code; n++) {
      curlen = nextlen; nextlen = tree[(n+1)*2+1];
      if (++count < max_count && curlen == nextlen) {
        continue;
      } else if (count < min_count) {
        do {
          send_code(curlen, bl_tree);
        } while (--count != 0);
      } else if (curlen != 0) {
        if (curlen != prevlen) {
          send_code(curlen, bl_tree);
          count--;
        }
        assert count >= 3 && count <= 6 : "3_6?";
        send_code(REP_3_6, bl_tree);
        send_bits(count - 3, 2);
      } else if (count <= 10) {
        send_code(REPZ_3_10, bl_tree);
        send_bits(count - 3, 3);
      } else {
        send_code(REPZ_11_138, bl_tree);
        send_bits(count - 11, 7);
      }
      count = 0;
      prevlen = curlen;
      if (nextlen == 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen == nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }

  // Construct the Huffman tree for the bit lengths and return the index in
  // bl_order of the last bit length code to send.
  final int build_bl_tree() {
    int max_blindex; // index of last bit length code of non zero freq

    // Determine the bit length frequencies for literal and distance trees
    scan_tree(dyn_ltree, l_desc.max_code);
    scan_tree(dyn_dtree, d_desc.max_code);

    // Build the bit length tree:
    bl_desc.build_tree(this);
    // opt_len now includes the length of the tree representations, except
    // the lengths of the bit lengths codes and the 5+5+4 bits for the counts.

    // Determine the number of bit length codes to send. The pkzip format
    // requires that at least 4 bit length codes be sent. (appnote.txt says
    // 3 but the actual value used is 4.)
    for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
      if (bl_tree[bl_order[max_blindex] * 2 + 1] != 0) {
        break;
      }
    }
    // Update opt_len to include the bit length tree and counts
    opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;

    return max_blindex;
  }

  // Send the header for a block using dynamic Huffman trees: the counts, the
  // lengths of the bit length codes, the literal tree and the distance tree.
  // IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
  final void send_all_trees(int lcodes, int dcodes, int blcodes) {
    int rank; // index in bl_order

    assert lcodes >= 257 && dcodes >= 1 && blcodes >= 4 : "not enough codes";
    assert lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES : "too many codes";
    send_bits(lcodes - 257, 5); // not +255 as stated in appnote.txt
    send_bits(dcodes - 1,   5);
    send_bits(blcodes - 4,  4); // not -3 as stated in appnote.txt
    for (rank = 0; rank < blcodes; rank++) {
      send_bits(bl_tree[bl_order[rank] * 2 + 1], 3);
    }
    send_tree(dyn_ltree, lcodes - 1); // literal tree
    send_tree(dyn_dtree, dcodes - 1); // distance tree
  }

  // Send a stored block
  final void tr_stored_block(int buf, int stored_len, boolean eof) {
    send_bits((STORED_BLOCK << 1) + (eof ? 1 : 0), 3); // send block type
    copy_block(buf, stored_len, true); // with header
  }

  // Flush the bits in the bit buffer to pending output (leaves at most 7 bits)
  final void tr_flush_bits() {
    bi_flush();
  }

  // Send one empty static block to give enough lookahead for inflate.
  // This takes 10 bits, of which 7 may remain in the bit buffer.
  final void tr_align() {
    send_bits(STATIC_TREES << 1, 3);
    send_code(END_BLOCK, static_ltree);
    bi_flush();
  }

  // Determine the best encoding for the current block: dynamic trees, static
  // trees or store, and output the encoded block to the zip file.
  final void tr_flush_block(int buf, int stored_len, boolean eof) {
    int opt_lenb, static_lenb; // opt_len and static_len in bytes
    int max_blindex = 0; // index of last bit length code of non zero freq

    // Build the Huffman trees unless a stored block is forced
    if (level > 0) {
      // Check if the file is binary or text
      if (data_type == Z_UNKNOWN) {
        data_type = detect_data_type();
      }

      // Construct the literal and distance trees
      l_desc.build_tree(this);
      d_desc.build_tree(this);
      // At this point, opt_len and static_len are the total bit lengths of
      // the compressed block data, excluding the tree representations.

      // Build the bit length tree for the above two trees, and get the index
      // in bl_order of the last bit length code to send.
      max_blindex = build_bl_tree();

      // Determine the best encoding. Compute the block lengths in bytes.
      opt_lenb = (opt_len + 3 + 7) >>> 3;
      static_lenb = (static_len + 3 + 7) >>> 3;

      if (static_lenb <= opt_lenb) {
        opt_lenb = static_lenb;
      }
    } else {
      opt_lenb = static_lenb = stored_len + 5; // force a stored block
    }

    if (stored_len + 4 <= opt_lenb && buf != -1) {
      // 4: two words for the lengths
      // The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
      // Otherwise we can't have processed more than WSIZE input bytes since
      // the last block flush, because compression would have been
      // successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
      // transform a block into a stored block.
      tr_stored_block(buf, stored_len, eof);
    } else if (strategy == Z_FIXED || static_lenb == opt_lenb) {
      send_bits((STATIC_TREES << 1) + (eof ? 1 : 0), 3);
      compress_block(static_ltree, static_dtree);
    } else {
      send_bits((DYN_TREES << 1) + (eof ? 1 : 0), 3);
      send_all_trees(l_desc.max_code + 1, d_desc.max_code + 1, max_blindex + 1);
      compress_block(dyn_ltree, dyn_dtree);
    }
    init_block();

    if (eof) {
      bi_windup();
    }
  }

  // Save the match info and tally the frequency counts. Return true if
  // the current block must be flushed.
  final boolean tr_tally(int dist, int lc) {
    pending_buf[d_buf + last_lit * 2] = (byte)(dist >>> 8);
    pending_buf[d_buf + last_lit * 2 + 1] = (byte)dist;
    l_buf[last_lit++] = (byte)lc;

    if (dist == 0) {
      // lc is the unmatched char
      dyn_ltree[lc * 2]++;
    } else {
      matches++;
      // Here, lc is the match length - MIN_MATCH
      dist--; // dist = match distance - 1
      assert dist < w_size - MIN_LOOKAHEAD &&
             lc <= MAX_MATCH - MIN_MATCH &&
             d_code(dist) < D_CODES : "tr_tally: bad match";

      dyn_ltree[(length_code[lc] + LITERALS + 1) * 2]++;
      dyn_dtree[d_code(dist) * 2]++;
    }

    return last_lit == lit_bufsize - 1;
    // We avoid equality with lit_bufsize because of wraparound at 64K
    // on 16 bit machines and because stored blocks are restricted to
    // 64K-1 bytes.
  }

  // Send the block data compressed using the given Huffman trees
  final void compress_block(short[] ltree, short[] dtree) {
    int dist; // distance of matched string
    int lc; // match length or unmatched char (if dist == 0)
    int lx = 0; // running index in l_buf
    int code; // the code to send
    int extra; // number of extra bits to send

    if (last_lit != 0) {
      do {
        dist = ((pending_buf[d_buf + lx * 2] & 0xFF) << 8) | (pending_buf[d_buf + lx * 2 + 1] & 0xFF);
        lc = l_buf[lx++] & 0xFF;
        if (dist == 0) {
          send_code(lc, ltree); // send a literal byte
        } else {
          // Here, lc is the match length - MIN_MATCH
          code = length_code[lc];
          send_code(code + LITERALS + 1, ltree); // send the length code
          extra = extra_lbits[code];
          if (extra != 0) {
            lc -= base_length[code];
            send_bits(lc, extra); // send the extra length bits
          }
          dist--; // dist is now the match distance - 1
          code = d_code(dist);
          assert code < D_CODES : "bad d_code";

          send_code(code, dtree); // send the distance code
          extra = extra_dbits[code];
          if (extra != 0) {
            dist -= base_dist[code];
            send_bits(dist, extra); // send the extra distance bits
          }
        } // literal or match pair ?

        // Check that the overlay between pending_buf and d_buf+l_buf is ok:
        assert pending < lit_bufsize + 2 * lx : "pendingBuf overflow";
      } while (lx < last_lit);
    }

    send_code(END_BLOCK, ltree);
  }

  // Check if the data type is TEXT or BINARY, using the following algorithm:
  // - TEXT if the two conditions below are satisfied:
  //    a) There are no non-portable control characters belonging to the
  //       "black list" (0..6, 14..25, 28..31).
  //    b) There is at least one printable character belonging to the
  //       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
  // - BINARY otherwise.
  // - The following partially-portable control characters form a
  //   "gray list" that is ignored in this detection algorithm:
  //   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
  // IN assertion: the fields Freq of dyn_ltree are set.
  final int detect_data_type() {
    // black_mask is the bit mask of black-listed bytes
    // set bits 0..6, 14..25, and 28..31
    // 0xf3ffc07f = binary 11110011111111111100000001111111
    int black_mask = 0xF3FFC07F;
    int n;

    // Check for non-textual ("black-listed") bytes.
    for (n = 0; n <= 31; n++, black_mask >>>= 1) {
      if ((black_mask & 1) != 0 && dyn_ltree[n * 2] != 0) {
        return Z_BINARY;
      }
    }

    // Check for textual ("white-listed") bytes.
    if (dyn_ltree[9 * 2] != 0 || dyn_ltree[10 * 2] != 0 || dyn_ltree[13 * 2] != 0) {
      return Z_TEXT;
    }
    for (n = 32; n < LITERALS; n++) {
      if (dyn_ltree[n * 2] != 0) {
        return Z_TEXT;
      }
    }

    // There are no "black-listed" or "white-listed" bytes:
    // this stream either is empty or has tolerated ("gray-listed") bytes only.
    return Z_BINARY;
  }

  // Reverse the first len bits of a code, using straightforward code (a faster
  // method would use a table)
  // IN assertion: 1 <= len <= 15
  static int bi_reverse(int code, int len) {
    int res = 0;
    do {
      res |= code & 1;
      code >>>= 1;
      res <<= 1;
    } while (--len > 0);
    return res >>> 1;
  }

  // Flush the bit buffer, keeping at most 7 bits in it.
  final void bi_flush() {
    if (bi_valid == 16) {
      put_short(bi_buf);
      bi_buf = 0;
      bi_valid = 0;
    } else if (bi_valid >= 8) {
      put_byte(bi_buf);
      bi_buf >>>= 8;
      bi_valid -= 8;
    }
  }

  // Flush the bit buffer and align the output on a byte boundary
  final void bi_windup() {
    if (bi_valid > 8) {
      put_short(bi_buf);
    } else if (bi_valid > 0) {
      put_byte(bi_buf);
    }
    bi_buf = 0;
    bi_valid = 0;
  }

  // Copy a stored block, storing first the length and its
  // one's complement if requested.
  final void copy_block(int buf, int len, boolean header) {
    bi_windup(); // align on byte boundary

    if (header) {
      put_short(len);
      put_short(~len);
    }
    System.arraycopy(window, buf, pending_buf, pending, len);
    pending += len;
  }

  // Send a code of the given tree.
  final void send_code(int c, short[] tree) {
    final int c2 = c * 2;
    send_bits(tree[c2] & 0xFFFF, tree[c2 + 1] & 0xFFFF);
  }

  final void putShortMSB(int w) {
    put_byte(w >>> 8);
    put_byte(w);
  }

  final void put_short(int w) {
    put_byte(w);
    put_byte(w >>> 8);
  }

  final void put_byte(int b) {
    pending_buf[pending++] = (byte)b;
  }


  static final class Tree implements Cloneable {
    // the dynamic tree
    short[] dyn_tree;

    // largest code with non zero frequency
    int max_code;

    // the corresponding static tree
    StaticTree stat_desc;

    Tree() {}

    Tree(Tree from) {
      if (from.dyn_tree != null) {
        dyn_tree = new short[from.dyn_tree.length];
        System.arraycopy(from.dyn_tree, 0, dyn_tree, 0, dyn_tree.length);
      }
      max_code = from.max_code;
      stat_desc = from.stat_desc;
    }

    @Override
    public Tree clone() {
      return new Tree(this);
    }

    // Compute the optimal bit lengths for a tree and update the total bit length
    // for the current block.
    // IN assertion: the fields freq and dad are set, heap[heap_max] and
    //    above are the tree nodes sorted by increasing frequency.
    // OUT assertions: the field len is set to the optimal bit length, the
    //     array bl_count contains the frequencies for each bit length.
    //     The length opt_len is updated; static_len is also updated if stree is
    //     not null.
    void gen_bitlen(Deflate<?> s) {
      short[] tree = dyn_tree;
      short[] stree = stat_desc.static_tree;
      int[] extra = stat_desc.extra_bits;
      int base = stat_desc.extra_base;
      int max_length = stat_desc.max_length;
      int h;  // heap index
      int n, m; // iterate over the tree elements
      int bits; // bit length
      int xbits; // extra bits
      short f; // frequency
      int overflow = 0; // number of elements with bit length too large

      for (bits = 0; bits <= MAX_BITS; bits++) {
        s.bl_count[bits] = 0;
      }

      // In a first pass, compute the optimal bit lengths (which may
      // overflow in the case of the bit length tree).
      tree[s.heap[s.heap_max] * 2 + 1] = 0; // root of the heap

      for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1] = (short)bits;
        // We overwrite tree[n].Dad which is no longer needed

        if (n > max_code) {
          continue;  // not a leaf node
        }

        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) {
          xbits = extra[n - base];
        }
        f = tree[n * 2];
        s.opt_len += f * (bits + xbits);
        if (stree != null) {
          s.static_len += f * (stree[n * 2 + 1] + xbits);
        }
      }
      if (overflow == 0) {
        return;
      }

      // Find the first bit length which could increase:
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] == 0) {
          bits--;
        }
        s.bl_count[bits]--; // move one leaf down the tree
        s.bl_count[bits + 1] += 2; // move one overflow item as its brother
        s.bl_count[max_length]--;
        // The brother of the overflow item also moves one step up,
        // but this does not affect bl_count[max_length]
        overflow -= 2;
      } while (overflow > 0);

      // Now recompute all bit lengths, scanning in increasing frequency.
      // h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
      // lengths instead of fixing only the wrong ones. This idea is taken
      // from 'ar' written by Haruhiko Okumura.)
      for (bits = max_length; bits != 0; bits--) {
        n = s.bl_count[bits];
        while (n != 0) {
          m = s.heap[--h];
          if (m > max_code) {
            continue;
          }
          if (tree[m * 2 + 1] != bits) {
            s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
            tree[m * 2 + 1] = (short)bits;
          }
          n--;
        }
      }
    }

    // Generate the codes for a given tree and bit counts (which need not be
    // optimal).
    // IN assertion: the array bl_count contains the bit length statistics for
    // the given tree and the field len is set for all tree elements.
    // OUT assertion: the field code is set for all tree elements of non
    //     zero code length.
    static void gen_codes(short[] tree, int max_code, short[] bl_count, short[] next_code) {
      short code = 0; // running code value
      int bits; // bit index
      int n; // code index

      // The distribution counts are first used to generate the code values
      // without bit reversal.
      next_code[0] = 0;
      for (bits = 1; bits <= MAX_BITS; bits++) {
        next_code[bits] = code = (short)((code + bl_count[bits - 1]) << 1);
      }

      // Check that the bit counts in bl_count are consistent. The last code
      // must be all ones.
      assert ((code + bl_count[MAX_BITS] - 1) & 0xFFFF) == (1 << MAX_BITS) - 1 : "inconsistent bit counts";

      for (n = 0; n <= max_code; n++) {
        final int len = tree[n * 2 + 1];
        if (len == 0) {
          continue;
        }
        // Now reverse the bits
        tree[n * 2] = (short)(bi_reverse(next_code[len]++, len));
      }
    }

    // Construct one Huffman tree and assigns the code bit strings and lengths.
    // Update the total bit length for the current block.
    // IN assertion: the field freq is set for all tree elements.
    // OUT assertions: the fields len and code are set to the optimal bit length
    //     and corresponding code. The length opt_len is updated; static_len is
    //     also updated if stree is not null. The field max_code is set.
    void build_tree(Deflate<?> s) {
      short[] tree = dyn_tree;
      short[] stree = stat_desc.static_tree;
      int elems = stat_desc.elems;
      int n, m; // iterate over heap elements
      int max_code = -1; // largest code with non zero frequency
      int node; // new node being created

      // Construct the initial heap, with least frequent element in
      // heap[1]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
      // heap[0] is not used.
      s.heap_len = 0;
      s.heap_max = HEAP_SIZE;

      for (n = 0; n < elems; n++) {
        if (tree[n * 2] != 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;
        } else {
          tree[n * 2 + 1] = 0;
        }
      }

      // The pkzip format requires that at least one distance code exists,
      // and that at least one bit should be sent even if there is only one
      // possible code. So to avoid special checks later on we force at least
      // two codes of non zero frequency.
      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
        tree[node * 2] = 1;
        s.depth[node] = 0;
        s.opt_len--;
        if (stree != null) {
          s.static_len -= stree[node * 2 + 1];
        }
        // node is 0 or 1 so it does not have extra bits
      }
      this.max_code = max_code;

      // The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
      // establish sub-heaps of increasing lengths:
      for (n = s.heap_len / 2; n >= 1; n--) {
        s.pqdownheap(tree, n);
      }

      // Construct the Huffman tree by repeatedly combining the least two
      // frequent nodes.
      node = elems; // next internal node of the tree
      do {
        n = s.heap[1]; // n = node of least frequency
        s.heap[1] = s.heap[s.heap_len--];
        s.pqdownheap(tree, 1);
        m = s.heap[1]; // m = node of next least frequency

        s.heap[--s.heap_max] = n; // keep the nodes sorted by frequency
        s.heap[--s.heap_max] = m;

        // Create a new node father of n and m
        tree[node * 2] = (short)(tree[n * 2] + tree[m * 2]);
        s.depth[node] = (byte)(Math.max(s.depth[n], s.depth[m]) + 1);
        tree[n * 2 + 1] = tree[m * 2 + 1] = (short)node;

        // and insert the new node in the heap
        s.heap[1] = node++;
        s.pqdownheap(tree, 1);
      } while (s.heap_len >= 2);

      s.heap[--s.heap_max] = s.heap[1];

      // At this point, the fields freq and dad are set. We can now
      // generate the bit lengths.
      gen_bitlen(s);

      // The field len is now set, we can generate the bit codes
      gen_codes(tree, max_code, s.bl_count, s.next_code);
    }
  }


  static final class StaticTree {
    // static tree or null
    final short[] static_tree;

    // extra bits for each code or null
    final int[] extra_bits;

    // base index for extra_bits
    final int extra_base;

    // max number of elements in the tree
    final int elems;

    // max bit length for the codes
    final int max_length;

    StaticTree(short[] static_tree, int[] extra_bits,  int extra_base, int elems, int max_length) {
      this.static_tree = static_tree;
      this.extra_bits = extra_bits;
      this.extra_base = extra_base;
      this.elems = elems;
      this.max_length = max_length;
    }
  }


  static final class Config {
    // reduce lazy search above this match length
    final int good_length;

    // do not perform lazy search above this match length
    final int max_lazy;

    // quit search above this match length
    final int nice_length;

    final int max_chain;

    final int func;

    Config(int good_length, int max_lazy, int nice_length, int max_chain, int func) {
      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    }
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

  // compression levels
  public static final int Z_NO_COMPRESSION = 0;
  public static final int Z_BEST_SPEED = 1;
  public static final int Z_BEST_COMPRESSION = 9;
  public static final int Z_DEFAULT_COMPRESSION = -1;

  // compression strategy
  public static final int Z_FILTERED = 1;
  public static final int Z_HUFFMAN_ONLY = 2;
  public static final int Z_RLE = 3;
  public static final int Z_FIXED = 4;
  public static final int Z_DEFAULT_STRATEGY = 0;

  // Possible values of the data_type field
  public static final int Z_BINARY = 0;
  public static final int Z_TEXT = 1;
  public static final int Z_UNKNOWN = 2;

  // Maximum value for windowBits
  public static final int MAX_WBITS = 15; // 32K LZ77 window

  // Default memLevel
  public static final int DEF_MEM_LEVEL = 8;

  //public static final int OS_MSDOS = 0x00;
  //public static final int OS_AMIGA = 0x01;
  //public static final int OS_VMS = 0x02;
  //public static final int OS_UNIX = 0x03;
  //public static final int OS_VMCMS = 0x04;
  //public static final int OS_ATARI = 0x05;
  //public static final int OS_OS2 = 0x06;
  //public static final int OS_MACOS = 0x07;
  //public static final int OS_ZSYSTEM = 0x08;
  //public static final int OS_CPM = 0x09;
  //public static final int OS_TOPS20 = 0x0A;
  //public static final int OS_WIN32 = 0x0B;
  //public static final int OS_QDOS = 0x0C;
  //public static final int OS_RISCOS = 0x0D;
  public static final int OS_UNKNOWN = 0xFF;
  public static final int OS_CODE = OS_UNKNOWN;

  // The deflate compression method
  static final int Z_DEFLATED = 8;

  // number of length codes, not counting the special END_BLOCK code
  static final int LENGTH_CODES = 29;

  // number of literal bytes 0..255
  static final int LITERALS = 256;

  // number of Literal or Length codes, including the END_BLOCK code
  static final int L_CODES = LITERALS + 1 + LENGTH_CODES;

  // number of distance codes
  static final int D_CODES = 30;

  // number of codes used to transfer the bit lengths
  static final int BL_CODES = 19;

  // maximum heap size
  static final int HEAP_SIZE = 2 * L_CODES + 1;

  // All codes must not exceed MAX_BITS bits
  static final int MAX_BITS = 15;

  // end of block literal code
  static final int END_BLOCK = 256;

  // size of bit buffer in bi_buf
  static final int BUF_SIZE = 16;

  // Stream status
  static final int INIT_STATE = 42;
  static final int EXTRA_STATE = 69;
  static final int NAME_STATE = 73;
  static final int COMMENT_STATE = 91;
  static final int HCRC_STATE = 103;
  static final int BUSY_STATE = 113;
  static final int FINISH_STATE = 666;

  // The three kinds of block type
  static final int STORED_BLOCK = 0;
  static final int STATIC_TREES = 1;
  static final int DYN_TREES = 2;

  static final int MIN_MATCH = 3;
  static final int MAX_MATCH = 258;

  // Minimum amount of lookahead, except at the end of the input file.
  static final int MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;

  // Matches of length 3 are discarded if their distance exceeds TOO_FAR
  static final int TOO_FAR = 4096;

  // Maximum value for memLevel in deflateInit
  static final int MAX_MEM_LEVEL = 9;

  // block not completed, need more input or more output
  static final int NEED_MORE = 0;

  // block flush performed
  static final int BLOCK_DONE = 1;

  // finish started, need only more output at next deflate
  static final int FINISH_STARTED = 2;

  // finish done, accept no more input or output
  static final int FINISH_DONE = 3;

  // preset dictionary flag in zlib header
  static final int PRESET_DICT = 0x20;

  // compress_func
  static final int STORED = 0;
  static final int FAST = 1;
  static final int SLOW = 2;

  static final Config[] configuration_table = {
    new Config(0, 0, 0, 0, STORED),
    new Config(4, 4, 8, 4, FAST),
    new Config(4, 5, 16, 8, FAST),
    new Config(4, 6, 32, 32, FAST),
    new Config(4, 4, 16, 16, SLOW),
    new Config(8, 16, 32, 32, SLOW),
    new Config(8, 16, 128, 128, SLOW),
    new Config(8, 32, 128, 256, SLOW),
    new Config(32, 128, 258, 1024, SLOW),
    new Config(32, 258, 258, 4096, SLOW)
  };

  static final String[] z_errmsg = {
    "need dictionary",     // Z_NEED_DICT      2
    "stream end",          // Z_STREAM_END     1
    "",                    // Z_OK             0
    "file error",          // Z_ERRNO         -1
    "stream error",        // Z_STREAM_ERROR  -2
    "data error",          // Z_DATA_ERROR    -3
    "insufficient memory", // Z_MEM_ERROR     -4
    "buffer error",        // Z_BUF_ERROR     -5
    "incompatible version",// Z_VERSION_ERROR -6
    ""
  };

  // Bit length codes must not exceed MAX_BL_BITS bits
  static final int MAX_BL_BITS = 7;

  // repeat previous bit length 3-6 times (2 bits of repeat count)
  static final int REP_3_6 = 16;

  // repeat a zero length 3-10 times (3 bits of repeat count)
  static final int REPZ_3_10 = 17;

  // repeat a zero length 11-138 times (7 bits of repeat count)
  static final int REPZ_11_138 = 18;

  // extra bits for each length code
  static final int[] extra_lbits = {
    0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0
  };

  // extra bits for each distance code
  static final int[] extra_dbits = {
    0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13
  };

  // extra bits for each bit length code
  static final int[] extra_blbits = {
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7
  };

  // The lengths of the bit length codes are sent in order of decreasing
  // probability, to avoid transmitting the lengths for unused bit length codes.
  static final byte[] bl_order = {
    16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15
  };

  // Mapping from a distance to a distance code. dist is the distance - 1 and
  // must not have side effects. dist_code[256] and dist_code[257] are never
  // used.
  static int d_code(int dist) {
    return dist < 256 ? dist_code[dist] : dist_code[256 + (dist >>> 7)];
  }

  // see definition of array dist_code below
  static final int DIST_CODE_LEN = 512;

  // Distance codes. The first 256 values correspond to the distances
  // 3 .. 258, the last 256 values correspond to the top 8 bits of
  // the 15 bit distances.
  static final byte[] dist_code = {
    0,  1,  2,  3,  4,  4,  5,  5,  6,  6,  6,  6,  7,  7,  7,  7,  8,  8,  8,  8,
    8,  8,  8,  8,  9,  9,  9,  9,  9,  9,  9,  9, 10, 10, 10, 10, 10, 10, 10, 10,
    10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
    11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
    12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13,
    13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
    13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
    14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
    14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
    14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,  0,  0, 16, 17,
    18, 18, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22,
    23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25,
    26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
    26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27,
    27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27,
    27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29,
    29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29,
    29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29,
    29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29
  };

  // length code for each normalized match length (0 == MIN_MATCH)
  static final byte[] length_code = {
    0,  1,  2,  3,  4,  5,  6,  7,  8,  8,  9,  9, 10, 10, 11, 11, 12, 12, 12, 12,
    13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16,
    17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19,
    19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25,
    25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26,
    26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
    26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27,
    27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28
  };

  // First normalized length for each code (0 = MIN_MATCH)
  static final int[] base_length = {
    0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56,
    64, 80, 96, 112, 128, 160, 192, 224, 0
  };

  // First normalized distance for each code (0 = distance of 1)
  static final int[] base_dist = {
       0,     1,     2,     3,     4,     6,     8,    12,    16,    24,
      32,    48,    64,    96,   128,   192,   256,   384,   512,   768,
    1024,  1536,  2048,  3072,  4096,  6144,  8192, 12288, 16384, 24576
  };

  // The static literal tree. Since the bit lengths are imposed, there is no
  // need for the L_CODES extra codes used during heap construction. However
  // The codes 286 and 287 are needed to build a canonical tree.
  static final short[] static_ltree = {
     12, 8, 140, 8,  76, 8, 204, 8,  44, 8,
    172, 8, 108, 8, 236, 8,  28, 8, 156, 8,
     92, 8, 220, 8,  60, 8, 188, 8, 124, 8,
    252, 8,   2, 8, 130, 8,  66, 8, 194, 8,
     34, 8, 162, 8,  98, 8, 226, 8,  18, 8,
    146, 8,  82, 8, 210, 8,  50, 8, 178, 8,
    114, 8, 242, 8,  10, 8, 138, 8,  74, 8,
    202, 8,  42, 8, 170, 8, 106, 8, 234, 8,
     26, 8, 154, 8,  90, 8, 218, 8,  58, 8,
    186, 8, 122, 8, 250, 8,   6, 8, 134, 8,
     70, 8, 198, 8,  38, 8, 166, 8, 102, 8,
    230, 8,  22, 8, 150, 8,  86, 8, 214, 8,
     54, 8, 182, 8, 118, 8, 246, 8,  14, 8,
    142, 8,  78, 8, 206, 8,  46, 8, 174, 8,
    110, 8, 238, 8,  30, 8, 158, 8,  94, 8,
    222, 8,  62, 8, 190, 8, 126, 8, 254, 8,
      1, 8, 129, 8,  65, 8, 193, 8,  33, 8,
    161, 8,  97, 8, 225, 8,  17, 8, 145, 8,
     81, 8, 209, 8,  49, 8, 177, 8, 113, 8,
    241, 8,   9, 8, 137, 8,  73, 8, 201, 8,
     41, 8, 169, 8, 105, 8, 233, 8,  25, 8,
    153, 8,  89, 8, 217, 8,  57, 8, 185, 8,
    121, 8, 249, 8,   5, 8, 133, 8,  69, 8,
    197, 8,  37, 8, 165, 8, 101, 8, 229, 8,
     21, 8, 149, 8,  85, 8, 213, 8,  53, 8,
    181, 8, 117, 8, 245, 8,  13, 8, 141, 8,
     77, 8, 205, 8,  45, 8, 173, 8, 109, 8,
    237, 8,  29, 8, 157, 8,  93, 8, 221, 8,
     61, 8, 189, 8, 125, 8, 253, 8,  19, 9,
    275, 9, 147, 9, 403, 9,  83, 9, 339, 9,
    211, 9, 467, 9,  51, 9, 307, 9, 179, 9,
    435, 9, 115, 9, 371, 9, 243, 9, 499, 9,
     11, 9, 267, 9, 139, 9, 395, 9,  75, 9,
    331, 9, 203, 9, 459, 9,  43, 9, 299, 9,
    171, 9, 427, 9, 107, 9, 363, 9, 235, 9,
    491, 9,  27, 9, 283, 9, 155, 9, 411, 9,
     91, 9, 347, 9, 219, 9, 475, 9,  59, 9,
    315, 9, 187, 9, 443, 9, 123, 9, 379, 9,
    251, 9, 507, 9,   7, 9, 263, 9, 135, 9,
    391, 9,  71, 9, 327, 9, 199, 9, 455, 9,
     39, 9, 295, 9, 167, 9, 423, 9, 103, 9,
    359, 9, 231, 9, 487, 9,  23, 9, 279, 9,
    151, 9, 407, 9,  87, 9, 343, 9, 215, 9,
    471, 9,  55, 9, 311, 9, 183, 9, 439, 9,
    119, 9, 375, 9, 247, 9, 503, 9,  15, 9,
    271, 9, 143, 9, 399, 9,  79, 9, 335, 9,
    207, 9, 463, 9,  47, 9, 303, 9, 175, 9,
    431, 9, 111, 9, 367, 9, 239, 9, 495, 9,
     31, 9, 287, 9, 159, 9, 415, 9,  95, 9,
    351, 9, 223, 9, 479, 9,  63, 9, 319, 9,
    191, 9, 447, 9, 127, 9, 383, 9, 255, 9,
    511, 9,   0, 7,  64, 7,  32, 7,  96, 7,
     16, 7,  80, 7,  48, 7, 112, 7,   8, 7,
     72, 7,  40, 7, 104, 7,  24, 7,  88, 7,
     56, 7, 120, 7,   4, 7,  68, 7,  36, 7,
    100, 7,  20, 7,  84, 7,  52, 7, 116, 7,
      3, 8, 131, 8,  67, 8, 195, 8,  35, 8,
    163, 8,  99, 8, 227, 8
  };

  // The static distance tree. (Actually a trivial tree since all codes use
  // 5 bits.)
  static final short[] static_dtree = {
     0, 5, 16, 5,  8, 5, 24, 5,  4, 5,
    20, 5, 12, 5, 28, 5,  2, 5, 18, 5,
    10, 5, 26, 5,  6, 5, 22, 5, 14, 5,
    30, 5,  1, 5, 17, 5,  9, 5, 25, 5,
     5, 5, 21, 5, 13, 5, 29, 5,  3, 5,
    19, 5, 11, 5, 27, 5,  7, 5, 23, 5
  };

  static final StaticTree static_l_desc = new StaticTree(static_ltree, extra_lbits,
    LITERALS + 1, L_CODES, MAX_BITS);

  static final StaticTree static_d_desc = new StaticTree(static_dtree, extra_dbits,
    0, D_CODES, MAX_BITS);

  static final StaticTree static_bl_desc = new StaticTree(null, extra_blbits,
    0, BL_CODES, MAX_BL_BITS);
}
