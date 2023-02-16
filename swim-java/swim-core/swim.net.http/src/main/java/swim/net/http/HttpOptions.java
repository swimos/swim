// Copyright 2015-2022 Swim.inc
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

package swim.net.http;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * HTTP configuration options.
 */
@Public
@Since("5.0")
public class HttpOptions implements ToSource {

  protected final int clientPipelineLength;
  protected final int serverPipelineLength;
  protected final int maxMessageSize;
  protected final int readBufferSize;
  protected final int writeBufferSize;

  public HttpOptions(int clientPipelineLength, int serverPipelineLength,
                     int maxMessageSize, int readBufferSize, int writeBufferSize) {
    this.clientPipelineLength = clientPipelineLength;
    this.serverPipelineLength = serverPipelineLength;
    this.maxMessageSize = maxMessageSize;
    this.readBufferSize = readBufferSize;
    this.writeBufferSize = writeBufferSize;
  }

  /**
   * Returns the maximum number of requests that can be enqueued
   * in an HTTP client pipeline.
   */
  public final int clientPipelineLength() {
    return this.clientPipelineLength;
  }

  /**
   * Returns a copy of these options configured with the given maximum
   * {@code clientPipelineLength}.
   */
  public HttpOptions clientPipelineLength(int clientPipelineLength) {
    return this.copy(clientPipelineLength, this.serverPipelineLength,
                     this.maxMessageSize, this.readBufferSize, this.writeBufferSize);
  }

  /**
   * Returns the maximum number of requests that can be enqueued
   * in an HTTP server pipeline.
   */
  public final int serverPipelineLength() {
    return this.serverPipelineLength;
  }

  /**
   * Returns a copy of these options configured with the given maximum
   * {@code serverPipelineLength}.
   */
  public HttpOptions serverPipelineLength(int serverPipelineLength) {
    return this.copy(this.clientPipelineLength, serverPipelineLength,
                     this.maxMessageSize, this.readBufferSize, this.writeBufferSize);
  }

  /**
   * Returns the maximum size in bytes on the wire of an HTTP message + payload.
   */
  public final int maxMessageSize() {
    return this.maxMessageSize;
  }

  /**
   * Returns a copy of these options configured with the given
   * {@code maxMessageSize} limit on HTTP message + payload sizes.
   */
  public HttpOptions maxMessageSize(int maxMessageSize) {
    return this.copy(this.clientPipelineLength, this.serverPipelineLength,
                     maxMessageSize, this.readBufferSize, this.writeBufferSize);
  }

  public final int readBufferSize() {
    return this.readBufferSize;
  }

  public HttpOptions readBufferSize(int readBufferSize) {
    return this.copy(this.clientPipelineLength, this.serverPipelineLength,
                     this.maxMessageSize, readBufferSize, this.writeBufferSize);
  }

  public final int writeBufferSize() {
    return this.writeBufferSize;
  }

  public HttpOptions writeBufferSize(int writeBufferSize) {
    return this.copy(this.clientPipelineLength, this.serverPipelineLength,
                     this.maxMessageSize, this.readBufferSize, writeBufferSize);
  }

  /**
   * Returns a copy of these options with the specified HTTP options.
   * Subclasses may override this method to ensure the proper class
   * is instantiated when updating options.
   */
  protected HttpOptions copy(int clientPipelineLength, int serverPipelineLength,
                             int maxMessageSize, int readBufferSize, int writeBufferSize) {
    return new HttpOptions(clientPipelineLength, serverPipelineLength,
                           maxMessageSize, readBufferSize, writeBufferSize);
  }

  /**
   * Returns {@code true} if these {@code HttpOptions} can possibly equal some
   * {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof HttpOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpOptions) {
      final HttpOptions that = (HttpOptions) other;
      return that.canEqual(this)
          && this.clientPipelineLength == that.clientPipelineLength
          && this.serverPipelineLength == that.serverPipelineLength
          && this.maxMessageSize == that.maxMessageSize
          && this.readBufferSize == that.readBufferSize
          && this.writeBufferSize == that.writeBufferSize;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HASH_SEED, this.clientPipelineLength), this.serverPipelineLength),
        this.maxMessageSize), this.readBufferSize), this.writeBufferSize));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpOptions", "standard").endInvoke()
            .beginInvoke("clientPipelineLength").appendArgument(this.clientPipelineLength).endInvoke()
            .beginInvoke("serverPipelineLength").appendArgument(this.serverPipelineLength).endInvoke()
            .beginInvoke("maxMessageSize").appendArgument(this.maxMessageSize).endInvoke()
            .beginInvoke("readBufferSize").appendArgument(this.readBufferSize).endInvoke()
            .beginInvoke("writeBufferSize").appendArgument(this.writeBufferSize).endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static @Nullable HttpOptions standard;

  /**
   * Returns the default {@code HttpOptions} instance.
   */
  public static HttpOptions standard() {
    if (HttpOptions.standard == null) {
      int clientPipelineLength;
      try {
        clientPipelineLength = Integer.parseInt(System.getProperty("swim.net.http.client.pipeline.length"));
      } catch (NumberFormatException error) {
        clientPipelineLength = 8;
      }

      int serverPipelineLength;
      try {
        serverPipelineLength = Integer.parseInt(System.getProperty("swim.net.http.server.pipeline.length"));
      } catch (NumberFormatException error) {
        serverPipelineLength = 8;
      }

      int maxMessageSize;
      try {
        maxMessageSize = Integer.parseInt(System.getProperty("swim.net.http.max.message.size"));
      } catch (NumberFormatException error) {
        maxMessageSize = 16 * 1024 * 1024;
      }

      int readBufferSize;
      try {
        readBufferSize = Integer.parseInt(System.getProperty("swim.net.http.read.buffer.size"));
      } catch (NumberFormatException error) {
        readBufferSize = 4 * 1024;
      }

      int writeBufferSize;
      try {
        writeBufferSize = Integer.parseInt(System.getProperty("swim.net.http.write.buffer.size"));
      } catch (NumberFormatException error) {
        writeBufferSize = 4 * 1024;
      }

      HttpOptions.standard = new HttpOptions(clientPipelineLength, serverPipelineLength,
                                             maxMessageSize, readBufferSize, writeBufferSize);
    }
    return HttpOptions.standard;
  }

}
