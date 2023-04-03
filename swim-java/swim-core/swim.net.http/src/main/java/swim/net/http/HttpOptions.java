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

  protected final int maxMessageSize;
  protected final int clientRequestBufferSize;
  protected final int serverRequestBufferSize;
  protected final int clientResponseBufferSize;
  protected final int serverResponseBufferSize;
  protected final int clientPipelineLength;
  protected final int serverPipelineLength;

  public HttpOptions(int maxMessageSize,
                     int clientRequestBufferSize, int serverRequestBufferSize,
                     int clientResponseBufferSize, int serverResponseBufferSize,
                     int clientPipelineLength, int serverPipelineLength) {
    this.maxMessageSize = maxMessageSize;
    this.clientRequestBufferSize = clientRequestBufferSize;
    this.serverRequestBufferSize = serverRequestBufferSize;
    this.clientResponseBufferSize = clientResponseBufferSize;
    this.serverResponseBufferSize = serverResponseBufferSize;
    this.clientPipelineLength = clientPipelineLength;
    this.serverPipelineLength = serverPipelineLength;
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
    return this.copy(maxMessageSize,
                     this.clientRequestBufferSize, this.serverRequestBufferSize,
                     this.clientResponseBufferSize, this.serverResponseBufferSize,
                     this.clientPipelineLength, this.serverPipelineLength);
  }

  public final int clientRequestBufferSize() {
    return this.clientRequestBufferSize;
  }

  public HttpOptions clientRequestBufferSize(int clientRequestBufferSize) {
    return this.copy(this.maxMessageSize,
                     clientRequestBufferSize, this.serverRequestBufferSize,
                     this.clientResponseBufferSize, this.serverResponseBufferSize,
                     this.clientPipelineLength, this.serverPipelineLength);
  }

  public final int serverRequestBufferSize() {
    return this.serverRequestBufferSize;
  }

  public HttpOptions serverRequestBufferSize(int serverRequestBufferSize) {
    return this.copy(this.maxMessageSize,
                     this.clientRequestBufferSize, serverRequestBufferSize,
                     this.clientResponseBufferSize, this.serverResponseBufferSize,
                     this.clientPipelineLength, this.serverPipelineLength);
  }

  public final int clientResponseBufferSize() {
    return this.clientResponseBufferSize;
  }

  public HttpOptions clientResponseBufferSize(int clientResponseBufferSize) {
    return this.copy(this.maxMessageSize,
                     this.clientRequestBufferSize, this.serverRequestBufferSize,
                     clientResponseBufferSize, this.serverResponseBufferSize,
                     this.clientPipelineLength, this.serverPipelineLength);
  }

  public final int serverResponseBufferSize() {
    return this.serverResponseBufferSize;
  }

  public HttpOptions serverResponseBufferSize(int serverResponseBufferSize) {
    return this.copy(this.maxMessageSize,
                     this.clientRequestBufferSize, this.serverRequestBufferSize,
                     this.clientResponseBufferSize, serverResponseBufferSize,
                     this.clientPipelineLength, this.serverPipelineLength);
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
    return this.copy(this.maxMessageSize,
                     this.clientRequestBufferSize, this.serverRequestBufferSize,
                     this.clientResponseBufferSize, this.serverResponseBufferSize,
                     clientPipelineLength, this.serverPipelineLength);
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
    return this.copy(this.maxMessageSize,
                     this.clientRequestBufferSize, this.serverRequestBufferSize,
                     this.clientResponseBufferSize, this.serverResponseBufferSize,
                     this.clientPipelineLength, serverPipelineLength);
  }

  /**
   * Returns a copy of these options with the specified HTTP options.
   * Subclasses may override this method to ensure the proper class
   * is instantiated when updating options.
   */
  protected HttpOptions copy(int maxMessageSize,
                             int clientRequestBufferSize, int serverRequestBufferSize,
                             int clientResponseBufferSize, int serverResponseBufferSize,
                             int clientPipelineLength, int serverPipelineLength) {
    return new HttpOptions(maxMessageSize,
                           clientRequestBufferSize, serverRequestBufferSize,
                           clientResponseBufferSize, serverResponseBufferSize,
                           clientPipelineLength, serverPipelineLength);
  }

  /**
   * Returns {@code true} if these {@code HttpOptions} can possibly equal
   * some {@code other} object.
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
          && this.maxMessageSize == that.maxMessageSize
          && this.clientRequestBufferSize == that.clientRequestBufferSize
          && this.serverRequestBufferSize == that.serverRequestBufferSize
          && this.clientResponseBufferSize == that.clientResponseBufferSize
          && this.serverResponseBufferSize == that.serverResponseBufferSize
          && this.clientPipelineLength == that.clientPipelineLength
          && this.serverPipelineLength == that.serverPipelineLength;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED, this.maxMessageSize),
        this.clientRequestBufferSize), this.serverRequestBufferSize),
        this.clientResponseBufferSize), this.serverResponseBufferSize),
        this.clientPipelineLength), this.serverPipelineLength));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpOptions", "standard").endInvoke()
            .beginInvoke("maxMessageSize").appendArgument(this.maxMessageSize).endInvoke()
            .beginInvoke("clientRequestBufferSize").appendArgument(this.clientRequestBufferSize).endInvoke()
            .beginInvoke("serverRequestBufferSize").appendArgument(this.serverRequestBufferSize).endInvoke()
            .beginInvoke("clientResponseBufferSize").appendArgument(this.clientResponseBufferSize).endInvoke()
            .beginInvoke("serverResponseBufferSize").appendArgument(this.serverResponseBufferSize).endInvoke()
            .beginInvoke("clientPipelineLength").appendArgument(this.clientPipelineLength).endInvoke()
            .beginInvoke("serverPipelineLength").appendArgument(this.serverPipelineLength).endInvoke();
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
      int maxMessageSize;
      try {
        maxMessageSize = Integer.parseInt(System.getProperty("swim.net.http.max.message.size"));
      } catch (NumberFormatException cause) {
        maxMessageSize = 16 * 1024 * 1024;
      }

      int clientRequestBufferSize;
      try {
        clientRequestBufferSize = Integer.parseInt(System.getProperty("swim.net.http.client.request.buffer.size"));
      } catch (NumberFormatException cause) {
        clientRequestBufferSize = 4 * 1024;
      }

      int serverRequestBufferSize;
      try {
        serverRequestBufferSize = Integer.parseInt(System.getProperty("swim.net.http.server.request.buffer.size"));
      } catch (NumberFormatException cause) {
        serverRequestBufferSize = 4 * 1024;
      }

      int clientResponseBufferSize;
      try {
        clientResponseBufferSize = Integer.parseInt(System.getProperty("swim.net.http.client.response.buffer.size"));
      } catch (NumberFormatException cause) {
        clientResponseBufferSize = 4 * 1024;
      }

      int serverResponseBufferSize;
      try {
        serverResponseBufferSize = Integer.parseInt(System.getProperty("swim.net.http.server.response.buffer.size"));
      } catch (NumberFormatException cause) {
        serverResponseBufferSize = 4 * 1024;
      }

      int clientPipelineLength;
      try {
        clientPipelineLength = Integer.parseInt(System.getProperty("swim.net.http.client.pipeline.length"));
      } catch (NumberFormatException cause) {
        clientPipelineLength = 8;
      }

      int serverPipelineLength;
      try {
        serverPipelineLength = Integer.parseInt(System.getProperty("swim.net.http.server.pipeline.length"));
      } catch (NumberFormatException cause) {
        serverPipelineLength = 8;
      }

      HttpOptions.standard = new HttpOptions(maxMessageSize,
                                             clientRequestBufferSize, serverRequestBufferSize,
                                             clientResponseBufferSize, serverResponseBufferSize,
                                             clientPipelineLength, serverPipelineLength);
    }
    return HttpOptions.standard;
  }

}
