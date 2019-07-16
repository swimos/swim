// Copyright 2015-2019 SWIM.AI inc.
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

package swim.io;

import java.util.concurrent.CountDownLatch;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.concurrent.Theater;
import static org.testng.Assert.assertEquals;

public abstract class IpModemBehaviors {
  protected abstract IpServiceRef bind(IpEndpoint endpoint, IpService service);

  protected abstract IpSocketRef connect(IpEndpoint endpoint, IpModem<?, ?> modem);

  @Test
  public void testConnection() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientConnect = new CountDownLatch(1);
    final CountDownLatch serverConnect = new CountDownLatch(1);
    final CountDownLatch serverBind = new CountDownLatch(1);
    final AbstractIpModem<Object, Object> client = new AbstractIpModem<Object, Object>() {
      @Override
      public void didConnect() {
        clientConnect.countDown();
      }
    };
    final AbstractIpModem<Object, Object> server = new AbstractIpModem<Object, Object>() {
      @Override
      public void didConnect() {
        serverConnect.countDown();
      }
    };
    final IpService service = new AbstractIpService() {
      @Override
      public IpModem<?, ?> createModem() {
        return server;
      }
      @Override
      public void didBind() {
        serverBind.countDown();
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      serverBind.await();
      connect(endpoint, client);
      serverConnect.await();
      clientConnect.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testClientConnectError() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientDisconnect = new CountDownLatch(1);
    final AbstractIpModem<Object, Object> modem = new AbstractIpModem<Object, Object>() {
      @Override
      public void didDisconnect() {
        clientDisconnect.countDown();
      }
    };

    try {
      stage.start();
      endpoint.start();
      connect(endpoint, modem);
      clientDisconnect.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testClientCloseOnConnect() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientConnect = new CountDownLatch(1);
    final CountDownLatch clientDisconnect = new CountDownLatch(1);
    final CountDownLatch serverConnect = new CountDownLatch(1);
    final CountDownLatch serverDisconnect = new CountDownLatch(1);
    final AbstractIpModem<String, String> client = new AbstractIpModem<String, String>() {
      @Override
      public void didConnect() {
        clientConnect.countDown();
        close();
      }
      @Override
      public void didDisconnect() {
        clientDisconnect.countDown();
      }
      @Override
      public void didFail(Throwable error) {
        throw new TestException(error);
      }
    };
    final AbstractIpModem<String, String> server = new AbstractIpModem<String, String>() {
      @Override
      public void didConnect() {
        read(Utf8.outputDecoder(Unicode.stringOutput()));
        serverConnect.countDown();
      }
      @Override
      public void didDisconnect() {
        serverDisconnect.countDown();
      }
      @Override
      public void didFail(Throwable error) {
        throw new TestException(error);
      }
    };
    final IpService service = new AbstractIpService() {
      @Override
      public IpModem<?, ?> createModem() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      clientConnect.await();
      clientDisconnect.await();
      serverConnect.await();
      serverDisconnect.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testServerCloseOnConnect() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientConnect = new CountDownLatch(1);
    final CountDownLatch clientDisconnect = new CountDownLatch(1);
    final CountDownLatch serverConnect = new CountDownLatch(1);
    final CountDownLatch serverDisconnect = new CountDownLatch(1);
    final AbstractIpModem<String, String> client = new AbstractIpModem<String, String>() {
      @Override
      public void didConnect() {
        clientConnect.countDown();
        close();
      }
      @Override
      public void didDisconnect() {
        read(Utf8.outputDecoder(Unicode.stringOutput()));
        clientDisconnect.countDown();
      }
      @Override
      public void didFail(Throwable error) {
        throw new TestException(error);
      }
    };
    final AbstractIpModem<String, String> server = new AbstractIpModem<String, String>() {
      @Override
      public void didConnect() {
        serverConnect.countDown();
        close();
      }
      @Override
      public void didDisconnect() {
        serverDisconnect.countDown();
      }
      @Override
      public void didFail(Throwable error) {
        throw new TestException(error);
      }
    };
    final IpService service = new AbstractIpService() {
      @Override
      public IpModem<?, ?> createModem() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      serverConnect.await();
      serverDisconnect.await();
      clientConnect.await();
      clientDisconnect.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testTransmitSingleLine() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientWrite = new CountDownLatch(1);
    final CountDownLatch serverWrite = new CountDownLatch(1);
    final CountDownLatch clientRead = new CountDownLatch(1);
    final CountDownLatch serverRead = new CountDownLatch(1);
    final AbstractIpModem<String, String> client = new AbstractIpModem<String, String>() {
      @Override
      public void didConnect() {
        write(Utf8.stringWriter("clientToServer\n"));
        read(Utf8.decodedParser(Unicode.lineParser()));
      }
      @Override
      public void didWrite(String line) {
        assertEquals(line, "clientToServer\n");
        clientWrite.countDown();
      }
      @Override
      public void didRead(String line) {
        assertEquals(line, "serverToClient");
        clientRead.countDown();
      }
    };
    final AbstractIpModem<String, String> server = new AbstractIpModem<String, String>() {
      @Override
      public void didConnect() {
        write(Utf8.stringWriter("serverToClient\n"));
        read(Utf8.decodedParser(Unicode.lineParser()));
      }
      @Override
      public void didWrite(String line) {
        assertEquals(line, "serverToClient\n");
        serverWrite.countDown();
      }
      @Override
      public void didRead(String line) {
        assertEquals(line, "clientToServer");
        serverRead.countDown();
      }
    };
    final IpService service = new AbstractIpService() {
      @Override
      public IpModem<?, ?> createModem() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      clientWrite.await();
      serverWrite.await();
      clientRead.await();
      serverRead.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }
  @Test
  public void testTransmitMultipleLines() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientWrite = new CountDownLatch(1);
    final CountDownLatch serverWrite = new CountDownLatch(1);
    final CountDownLatch clientRead = new CountDownLatch(1);
    final CountDownLatch serverRead = new CountDownLatch(1);
    final String phrase = "Hello, world!";
    final String line = phrase + "\n";
    final int lineCount = 1024;
    final AbstractIpModem<String, String> client = new AbstractIpModem<String, String>() {
      int writeCount;
      int readCount;
      @Override
      public void didConnect() {
        write(Utf8.stringWriter(line));
        read(Utf8.decodedParser(Unicode.lineParser()));
      }
      @Override
      public void didWrite(String line) {
        writeCount += 1;
        if (writeCount < lineCount) {
          write(Utf8.stringWriter(line));
        } else {
          write(Utf8.stringWriter("\n"));
          clientWrite.countDown();
        }
      }
      @Override
      public void didRead(String line) {
        assertEquals(line, phrase);
        readCount += 1;
        if (readCount < lineCount) {
          read(Utf8.decodedParser(Unicode.lineParser()));
        } else {
          clientRead.countDown();
        }
      }
    };
    final AbstractIpModem<String, String> server = new AbstractIpModem<String, String>() {
      int writeCount;
      int readCount;
      @Override
      public void didConnect() {
        write(Utf8.stringWriter(line));
        read(Utf8.decodedParser(Unicode.lineParser()));
      }
      @Override
      public void didWrite(String line) {
        writeCount += 1;
        if (writeCount < lineCount) {
          write(Utf8.stringWriter(line));
        } else {
          write(Utf8.stringWriter("\n"));
          serverWrite.countDown();
        }
      }
      @Override
      public void didRead(String line) {
        assertEquals(line, phrase);
        readCount += 1;
        if (readCount < lineCount) {
          read(Utf8.decodedParser(Unicode.lineParser()));
        } else {
          serverRead.countDown();
        }
      }
    };
    final IpService service = new AbstractIpService() {
      @Override
      public IpModem<?, ?> createModem() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      clientWrite.await();
      serverWrite.await();
      clientRead.await();
      serverRead.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }

  private String blob(int size) {
    final StringBuilder s = new StringBuilder(size);
    for (int i = 0; i < size; i += 1) {
      s.append(' ');
    }
    return s.toString();
  }
  @Test
  public void testTransmitBlobs() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientWrite = new CountDownLatch(1);
    final CountDownLatch serverWrite = new CountDownLatch(1);
    final CountDownLatch clientRead = new CountDownLatch(1);
    final CountDownLatch serverRead = new CountDownLatch(1);
    final int chunkSize = 1024;
    final int chunkCount = 1024;
    final String chunk = blob(chunkSize);
    final AbstractIpModem<String, String> client = new AbstractIpModem<String, String>() {
      int writeCount;
      @Override
      public void didConnect() {
        write(Utf8.stringWriter(chunk));
        read(Utf8.decodedParser(Unicode.lineParser()));
      }
      @Override
      public void didWrite(String line) {
        writeCount += 1;
        if (writeCount < chunkCount) {
          write(Utf8.stringWriter(chunk));
        } else {
          write(Utf8.stringWriter("\n"));
          clientWrite.countDown();
        }
      }
      @Override
      public void didRead(String line) {
        assertEquals(line.length(), chunkSize * chunkCount);
        clientRead.countDown();
      }
    };
    final AbstractIpModem<String, String> server = new AbstractIpModem<String, String>() {
      int writeCount;
      @Override
      public void didConnect() {
        write(Utf8.stringWriter(chunk));
        read(Utf8.decodedParser(Unicode.lineParser()));
      }
      @Override
      public void didWrite(String line) {
        writeCount += 1;
        if (writeCount < chunkCount) {
          write(Utf8.stringWriter(chunk));
        } else {
          write(Utf8.stringWriter("\n"));
          serverWrite.countDown();
        }
      }
      @Override
      public void didRead(String line) {
        assertEquals(line.length(), chunkSize * chunkCount);
        serverRead.countDown();
      }
    };
    final IpService service = new AbstractIpService() {
      @Override
      public IpModem<?, ?> createModem() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      clientWrite.await();
      serverWrite.await();
      clientRead.await();
      serverRead.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }
}
