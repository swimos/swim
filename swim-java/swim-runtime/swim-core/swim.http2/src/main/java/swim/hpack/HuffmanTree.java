// Copyright 2015-2023 Nstream, inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.hpack;

final class HuffmanTree {

  final int symbol; // terminal node symbol
  final int bits; // number of matched bits
  final HuffmanTree[] children; // internal node children

  private HuffmanTree(int symbol, int bits) {
    assert 0 < bits && bits <= 8;
    this.symbol = symbol;
    this.bits = bits;
    this.children = null;
  }

  private HuffmanTree() {
    this.symbol = 0;
    this.bits = 8;
    this.children = new HuffmanTree[256];
  }

  boolean isTerminal() {
    return this.children == null;
  }

  static HuffmanTree build(int[] codes, byte[] lengths) {
    final HuffmanTree root = new HuffmanTree();
    for (int i = 0; i < codes.length; i++) {
      HuffmanTree.insert(root, i, codes[i], lengths[i]);
    }
    return root;
  }

  private static void insert(HuffmanTree root, int symbol, int code, byte length) {
    // traverse the tree using the most significant bytes of the code
    HuffmanTree current = root;
    while (length > 8) {
      if (current.isTerminal()) {
        throw new IllegalStateException("non-unique Huffman code prefix");
      }
      length -= 8;
      final int i = (code >>> length) & 0xFF;
      if (current.children[i] == null) {
        current.children[i] = new HuffmanTree();
      }
      current = current.children[i];
    }

    final HuffmanTree terminal = new HuffmanTree(symbol, length);
    final int shift = 8 - length;
    final int start = (code << shift) & 0xFF;
    final int end = 1 << shift;
    for (int i = start; i < start + end; i++) {
      current.children[i] = terminal;
    }
  }

}
