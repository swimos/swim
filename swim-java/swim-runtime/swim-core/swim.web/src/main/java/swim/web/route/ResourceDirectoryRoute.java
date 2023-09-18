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

package swim.web.route;

import java.io.IOException;
import swim.http.HttpBody;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.uri.UriPath;
import swim.web.WebRequest;
import swim.web.WebResponse;
import swim.web.WebRoute;

public final class ResourceDirectoryRoute implements WebRoute {

  final ClassLoader classLoader;
  final UriPath directory;
  final String indexFile;

  public ResourceDirectoryRoute(ClassLoader classLoader, UriPath directory, String indexFile) {
    this.classLoader = classLoader;
    this.directory = directory;
    this.indexFile = indexFile;
  }

  @Override
  public WebResponse routeRequest(WebRequest request) {
    UriPath path = request.routePath();
    if (path.foot().isAbsolute()) {
      path = path.appended(this.indexFile);
    }
    if (path.isAbsolute()) {
      path = path.tail();
    }
    path = this.directory.appended(path).removeDotSegments();
    if (path.isRelativeTo(this.directory)) {
      try {
        final HttpBody<Object> body = HttpBody.fromResource(this.classLoader, path.toString());
        if (body != null) {
          final HttpResponse<Object> response = HttpResponse.create(HttpStatus.OK).content(body);
          return request.respond(response);
        }
      } catch (IOException error) {
        // continue
      }
    }
    return request.reject();
  }

}
