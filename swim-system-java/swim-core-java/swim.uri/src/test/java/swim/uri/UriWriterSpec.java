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

package swim.uri;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class UriWriterSpec {
  @Test
  public void writeEmptyURIs() {
    assertEquals(Uri.empty().toString(), "");
  }

  @Test
  public void writeURIsWithSchemes() {
    assertEquals(Uri.empty().schemeName("scheme").toString(), "scheme:");
    assertEquals(Uri.empty().schemeName("az09+-.").toString(), "az09+-.:");
  }

  @Test
  public void writeURIsWithEmptyAuthorities() {
    assertEquals(Uri.empty().hostName("").toString(), "//");
  }

  @Test
  public void writeURIsWithHostNames() {
    assertEquals(Uri.empty().hostName("domain").toString(), "//domain");
  }

  @Test
  public void writeURIsWithHostNamesContainingPercentEscapes() {
    assertEquals(Uri.empty().hostName("//").toString(), "//%2f%2f");
    assertEquals(Uri.empty().hostName("a/b/c").toString(), "//a%2fb%2fc");
  }

  @Test
  public void writeURIsWithIPv4Addresses() {
    assertEquals(Uri.empty().hostIPv4("127.0.0.1").toString(), "//127.0.0.1");
    assertEquals(Uri.empty().hostIPv4("255.255.255.255").toString(), "//255.255.255.255");
  }

  @Test
  public void writeURIsWithIPv6Addresses() {
    assertEquals(Uri.empty().hostIPv6("::1").toString(), "//[::1]");
  }

  @Test
  public void writeURIsWithHostNamesAndPorts() {
    assertEquals(Uri.empty().hostName("domain").portNumber(80).toString(), "//domain:80");
  }

  @Test
  public void writeURIsWithIPv4AddressesAndPorts() {
    assertEquals(Uri.empty().hostIPv4("127.0.0.1").portNumber(80).toString(), "//127.0.0.1:80");
  }

  @Test
  public void writeURIsWithIPv6AddressesAndPorts() {
    assertEquals(Uri.empty().hostIPv6("::1").portNumber(80).toString(), "//[::1]:80");
  }

  @Test
  public void writeURIsWithPortsButNotHost() {
    assertEquals(Uri.empty().hostName("").portNumber(80).toString(), "//:80");
  }

  @Test
  public void writeURIsWithEmptyUsers() {
    assertEquals(Uri.empty().username("").hostName("").toString(), "//@");
  }

  @Test
  public void writeURIsWithUsersButNotHosts() {
    assertEquals(Uri.empty().username("user").hostName("").toString(), "//user@");
  }

  @Test
  public void writeURIsWithUsernamesAndPasswordsButNotHosts() {
    assertEquals(Uri.empty().username("user", "pass").hostName("").toString(), "//user:pass@");
  }

  @Test
  public void writeURIsWithUsersContainingPercentEscapes() {
    assertEquals(Uri.empty().username("/:").hostName("").toString(), "//%2f%3a@");
    assertEquals(Uri.empty().username("a/b:c").hostName("").toString(), "//a%2fb%3ac@");
  }

  @Test
  public void writeURIsWithUsernamesAndPasswordsContainingPercentEscapes() {
    assertEquals(Uri.empty().username("/:", ":/").hostName("").toString(), "//%2f%3a:%3a%2f@");
    assertEquals(Uri.empty().username("a/b:c", "d:e/f").hostName("").toString(), "//a%2fb%3ac:d%3ae%2ff@");
  }

  @Test
  public void writeURIsWithUsersAndHostNames() {
    assertEquals(Uri.empty().username("user").hostName("domain").toString(), "//user@domain");
  }

  @Test
  public void writeURIsWithUsernamesAndPasswordsAndHostNames() {
    assertEquals(Uri.empty().username("user", "pass").hostName("domain").toString(), "//user:pass@domain");
  }

  @Test
  public void writeURIsWithUsesAndIPv4Addresses() {
    assertEquals(Uri.empty().username("user").hostIPv4("127.0.0.1").toString(), "//user@127.0.0.1");
  }

  @Test
  public void writeURIsWithUsernamesAndPasswordsndIPv4Addresses() {
    assertEquals(Uri.empty().username("user", "pass").hostIPv4("127.0.0.1").toString(), "//user:pass@127.0.0.1");
  }

  @Test
  public void writeURIsWithUsersAndIPv6Addresses() {
    assertEquals(Uri.empty().username("user").hostIPv6("::1").toString(), "//user@[::1]");
  }

  @Test
  public void writeURIsWithUsernamesAndPasswordsAndIPv6Addresses() {
    assertEquals(Uri.empty().username("user", "pass").hostIPv6("::1").toString(), "//user:pass@[::1]");
  }

  @Test
  public void writeURIsWithUsersAndHostNamesAndPorts() {
    assertEquals(Uri.empty().username("user").hostName("domain").portNumber(80).toString(), "//user@domain:80");
  }

  @Test
  public void writeURIsWithUsesAndIPv4AddressesAndPorts() {
    assertEquals(Uri.empty().username("user").hostIPv4("127.0.0.1").portNumber(80).toString(), "//user@127.0.0.1:80");
  }

  @Test
  public void writeURIsWithUsersAndIPv6AddressesAndPorts() {
    assertEquals(Uri.empty().username("user").hostIPv6("::1").portNumber(80).toString(), "//user@[::1]:80");
  }

  @Test
  public void writeURIsWithAbsolutePaths() {
    assertEquals(Uri.empty().path("/").toString(), "/");
    assertEquals(Uri.empty().path("/", "one").toString(), "/one");
    assertEquals(Uri.empty().path("/", "one", "/").toString(), "/one/");
    assertEquals(Uri.empty().path("/", "one", "/", "two").toString(), "/one/two");
    assertEquals(Uri.empty().path("/", "one", "/", "two", "/").toString(), "/one/two/");
  }

  @Test
  public void writeURIsWithRelativePaths() {
    assertEquals(Uri.empty().path("one").toString(), "one");
    assertEquals(Uri.empty().path("one", "/").toString(), "one/");
    assertEquals(Uri.empty().path("one", "/", "two").toString(), "one/two");
    assertEquals(Uri.empty().path("one", "/", "two", "/").toString(), "one/two/");
  }

  @Test
  public void writeURIsWithPathsContainingPermittedDelimeters() {
    assertEquals(Uri.empty().path("/", "one", "/", "!$&()*+,;=\'", "/", "three").toString(), "/one/!$&()*+,;='/three");
  }

  @Test
  public void writeURIsWithPathsContainingPercentEscapes() {
    assertEquals(Uri.empty().path("/", ":/:").toString(), "/:%2f:");
    assertEquals(Uri.empty().path("/", "a:b/c:d").toString(), "/a:b%2fc:d");
    assertEquals(Uri.empty().path(" ").toString(), "%20");
  }

  @Test
  public void writeURIsWithEmptyQueries() {
    assertEquals(Uri.empty().query(null, "").toString(), "?");
  }

  @Test
  public void writeURIsWithQueryParts() {
    assertEquals(Uri.empty().query(null, "query").toString(), "?query");
  }

  @Test
  public void writeURIsWithQueryParams() {
    assertEquals(Uri.empty().query("key", "value").toString(), "?key=value");
    assertEquals(Uri.empty().query("k1", "v1", "k2", "v2").toString(), "?k1=v1&k2=v2");
    assertEquals(Uri.empty().query("k1", "v=1").toString(), "?k1=v=1");
    assertEquals(Uri.empty().query("k1", "").toString(), "?k1=");
    assertEquals(Uri.empty().query("", "v1").toString(), "?=v1");
    assertEquals(Uri.empty().query("", "").toString(), "?=");
    assertEquals(Uri.empty().query(null, "a", null, "b").toString(), "?a&b");
    assertEquals(Uri.empty().query(null, "a", "a", "b", null, "b").toString(), "?a&a=b&b");
    assertEquals(Uri.empty().query(null, "", null, "").toString(), "?&");
  }

  @Test
  public void writeURIsWithQueriesContainingPermittedDelimeters() {
    assertEquals(Uri.empty().query(null, "!$()*+,/:;?@'").toString(), "?!$()*+,/:;?@'");
  }

  @Test
  public void writeURIsWithQueryPartsContainingPercentEscapes() {
    assertEquals(Uri.empty().query(null, "a?b?c").toString(), "?a?b?c");
  }

  @Test
  public void writeURIsWithEmptyFragments() {
    assertEquals(Uri.empty().fragmentIdentifier("").toString(), "#");
  }

  @Test
  public void writeURIsWithFragmentIdentifiers() {
    assertEquals(Uri.empty().fragmentIdentifier("fragment").toString(), "#fragment");
  }

  @Test
  public void writeURIsWithFragmentsContainingPermittedDelimeters() {
    assertEquals(Uri.empty().fragmentIdentifier("!$&()*+,/:;?@='").toString(), "#!$&()*+,/:;?@='");
  }

  @Test
  public void writeURIsWithFragmentsContainingPercentEscapes() {
    assertEquals(Uri.empty().fragmentIdentifier("##").toString(), "#%23%23");
    assertEquals(Uri.empty().fragmentIdentifier("a#b#c").toString(), "#a%23b%23c");
  }

  @Test
  public void writeURIsWithSchemesAndAuthorities() {
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").toString(), "scheme://domain");
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).toString(), "scheme://domain:80");
    assertEquals(Uri.empty().schemeName("scheme").username("user").hostName("domain").toString(), "scheme://user@domain");
    assertEquals(Uri.empty().schemeName("scheme").username("user").hostName("domain").portNumber(80).toString(), "scheme://user@domain:80");
  }

  @Test
  public void writeURIsWithSchemesAndAbsolutePaths() {
    assertEquals(Uri.empty().schemeName("scheme").path("/").toString(), "scheme:/");
    assertEquals(Uri.empty().schemeName("scheme").path("/", "one").toString(), "scheme:/one");
    assertEquals(Uri.empty().schemeName("scheme").path("/", "one", "/").toString(), "scheme:/one/");
    assertEquals(Uri.empty().schemeName("scheme").path("/", "one", "/", "two").toString(), "scheme:/one/two");
    assertEquals(Uri.empty().schemeName("scheme").path("/", "one", "/", "two", "/").toString(), "scheme:/one/two/");
  }

  @Test
  public void writeURIsWithSchemesAndRelativePaths() {
    assertEquals(Uri.empty().schemeName("scheme").path("one").toString(), "scheme:one");
    assertEquals(Uri.empty().schemeName("scheme").path("one", "/").toString(), "scheme:one/");
    assertEquals(Uri.empty().schemeName("scheme").path("one", "/", "two").toString(), "scheme:one/two");
    assertEquals(Uri.empty().schemeName("scheme").path("one", "/", "two", "/").toString(), "scheme:one/two/");
  }

  @Test
  public void writeURIsWithSchemesAndQueries() {
    assertEquals(Uri.empty().schemeName("scheme").query(null, "query").toString(), "scheme:?query");
    assertEquals(Uri.empty().schemeName("scheme").query("key", "value").toString(), "scheme:?key=value");
  }

  @Test
  public void writeURIsWithSchemesAndFragments() {
    assertEquals(Uri.empty().schemeName("scheme").fragmentIdentifier("fragment").toString(), "scheme:#fragment");
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesAndPaths() {
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").path("/", "path").toString(), "scheme://domain/path");
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").toString(), "scheme://domain:80/path");
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesAndQueries() {
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").query(null, "query").toString(), "scheme://domain?query");
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).query(null, "query").toString(), "scheme://domain:80?query");
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesAndFragments() {
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").fragmentIdentifier("fragment").toString(), "scheme://domain#fragment");
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).fragmentIdentifier("fragment").toString(), "scheme://domain:80#fragment");
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesPathsAndQueries() {
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").path("/", "path").query(null, "query").toString(), "scheme://domain/path?query");
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").query(null, "query").toString(), "scheme://domain:80/path?query");
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesPathsAndFragments() {
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").path("/", "path").fragmentIdentifier("fragment").toString(), "scheme://domain/path#fragment");
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").fragmentIdentifier("fragment").toString(), "scheme://domain:80/path#fragment");
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesPathsQueriesAndFragments() {
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").path("/", "path").query(null, "query").fragmentIdentifier("fragment").toString(), "scheme://domain/path?query#fragment");
    assertEquals(Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").query(null, "query").fragmentIdentifier("fragment").toString(), "scheme://domain:80/path?query#fragment");
  }
}
