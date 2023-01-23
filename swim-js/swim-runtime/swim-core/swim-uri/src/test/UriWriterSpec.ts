// Copyright 2015-2023 Swim.inc
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

import {Spec, Test, Exam} from "@swim/unit";
import {Uri} from "@swim/uri";

export class UriWriterSpec extends Spec {
  @Test
  writeEmptyURIs(exam: Exam): void {
    exam.equal(Uri.empty().toString(), "");
  }

  @Test
  writeURIsWithSchemes(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").toString(), "scheme:");
    exam.equal(Uri.schemeName("az09+-.").toString(), "az09+-.:");
  }

  @Test
  writeURIsWithEmptyAuthorities(exam: Exam): void {
    exam.equal(Uri.hostName("").toString(), "//");
  }

  @Test
  writeURIsWithHostNames(exam: Exam): void {
    exam.equal(Uri.hostName("domain").toString(), "//domain");
  }

  @Test
  writeURIsWithHostNamesContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.hostName("//").toString(), "//%2f%2f");
    exam.equal(Uri.hostName("a/b/c").toString(), "//a%2fb%2fc");
  }

  @Test
  writeURIsWithIPv4Addresses(exam: Exam): void {
    exam.equal(Uri.hostIPv4("127.0.0.1").toString(), "//127.0.0.1");
    exam.equal(Uri.hostIPv4("255.255.255.255").toString(), "//255.255.255.255");
  }

  @Test
  writeURIsWithIPv6Addresses(exam: Exam): void {
    exam.equal(Uri.hostIPv6("::1").toString(), "//[::1]");
  }

  @Test
  writeURIsWithHostNamesAndPorts(exam: Exam): void {
    exam.equal(Uri.hostName("domain").withPortNumber(80).toString(), "//domain:80");
  }

  @Test
  writeURIsWithIPv4AddressesAndPorts(exam: Exam): void {
    exam.equal(Uri.hostIPv4("127.0.0.1").withPortNumber(80).toString(), "//127.0.0.1:80");
  }

  @Test
  writeURIsWithIPv6AddressesAndPorts(exam: Exam): void {
    exam.equal(Uri.hostIPv6("::1").withPortNumber(80).toString(), "//[::1]:80");
  }

  @Test
  writeURIsWithPortsButNotHost(exam: Exam): void {
    exam.equal(Uri.hostName("").withPortNumber(80).toString(), "//:80");
  }

  @Test
  writeURIsWithEmptyUsers(exam: Exam): void {
    exam.equal(Uri.username("").withHostName("").toString(), "//@");
  }

  @Test
  writeURIsWithUsersButNotHosts(exam: Exam): void {
    exam.equal(Uri.username("user").withHostName("").toString(), "//user@");
  }

  @Test
  writeURIsWithUsernamesAndPasswordsButNotHosts(exam: Exam): void {
    exam.equal(Uri.username("user", "pass").withHostName("").toString(), "//user:pass@");
  }

  @Test
  writeURIsWithUsersContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.username("/:").withHostName("").toString(), "//%2f%3a@");
    exam.equal(Uri.username("a/b:c").withHostName("").toString(), "//a%2fb%3ac@");
  }

  @Test
  writeURIsWithUsernamesAndPasswordsContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.username("/:", ":/").withHostName("").toString(), "//%2f%3a:%3a%2f@");
    exam.equal(Uri.username("a/b:c", "d:e/f").withHostName("").toString(), "//a%2fb%3ac:d%3ae%2ff@");
  }

  @Test
  writeURIsWithUsersAndHostNames(exam: Exam): void {
    exam.equal(Uri.username("user").withHostName("domain").toString(), "//user@domain");
  }

  @Test
  writeURIsWithUsernamesAndPasswordsAndHostNames(exam: Exam): void {
    exam.equal(Uri.username("user", "pass").withHostName("domain").toString(), "//user:pass@domain");
  }

  @Test
  writeURIsWithUsesAndIPv4Addresses(exam: Exam): void {
    exam.equal(Uri.username("user").withHostIPv4("127.0.0.1").toString(), "//user@127.0.0.1");
  }

  @Test
  writeURIsWithUsernamesAndPasswordsndIPv4Addresses(exam: Exam): void {
    exam.equal(Uri.username("user", "pass").withHostIPv4("127.0.0.1").toString(), "//user:pass@127.0.0.1");
  }

  @Test
  writeURIsWithUsersAndIPv6Addresses(exam: Exam): void {
    exam.equal(Uri.username("user").withHostIPv6("::1").toString(), "//user@[::1]");
  }

  @Test
  writeURIsWithUsernamesAndPasswordsAndIPv6Addresses(exam: Exam): void {
    exam.equal(Uri.username("user", "pass").withHostIPv6("::1").toString(), "//user:pass@[::1]");
  }

  @Test
  writeURIsWithUsersAndHostNamesAndPorts(exam: Exam): void {
    exam.equal(Uri.username("user").withHostName("domain").withPortNumber(80).toString(), "//user@domain:80");
  }

  @Test
  writeURIsWithUsesAndIPv4AddressesAndPorts(exam: Exam): void {
    exam.equal(Uri.username("user").withHostIPv4("127.0.0.1").withPortNumber(80).toString(), "//user@127.0.0.1:80");
  }

  @Test
  writeURIsWithUsersAndIPv6AddressesAndPorts(exam: Exam): void {
    exam.equal(Uri.username("user").withHostIPv6("::1").withPortNumber(80).toString(), "//user@[::1]:80");
  }

  @Test
  writeURIsWithAbsolutePaths(exam: Exam): void {
    exam.equal(Uri.path("/").toString(), "/");
    exam.equal(Uri.path("/", "one").toString(), "/one");
    exam.equal(Uri.path("/", "one", "/").toString(), "/one/");
    exam.equal(Uri.path("/", "one", "/", "two").toString(), "/one/two");
    exam.equal(Uri.path("/", "one", "/", "two", "/").toString(), "/one/two/");
  }

  @Test
  writeURIsWithRelativePaths(exam: Exam): void {
    exam.equal(Uri.path("one").toString(), "one");
    exam.equal(Uri.path("one", "/").toString(), "one/");
    exam.equal(Uri.path("one", "/", "two").toString(), "one/two");
    exam.equal(Uri.path("one", "/", "two", "/").toString(), "one/two/");
  }

  @Test
  writeURIsWithPathsContainingPermittedDelimeters(exam: Exam): void {
    exam.equal(Uri.path("/", "one", "/", "!$&()*+,;='", "/", "three").toString(), "/one/!$&()*+,;='/three");
  }

  @Test
  writeURIsWithPathsContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.path("/", ":/:").toString(), "/:%2f:");
    exam.equal(Uri.path("/", "a:b/c:d").toString(), "/a:b%2fc:d");
    exam.equal(Uri.path(" ").toString(), "%20");
  }

  @Test
  writeURIsWithEmptyQueries(exam: Exam): void {
    exam.equal(Uri.query({$0: ""}).toString(), "?");
  }

  @Test
  writeURIsWithQueryParts(exam: Exam): void {
    exam.equal(Uri.query({$0: "query"}).toString(), "?query");
  }

  @Test
  writeURIsWithQueryParams(exam: Exam): void {
    exam.equal(Uri.query({key: "value"}).toString(), "?key=value");
    exam.equal(Uri.query({k1: "v1", k2: "v2"}).toString(), "?k1=v1&k2=v2");
    exam.equal(Uri.query({k1: "v=1"}).toString(), "?k1=v=1");
    exam.equal(Uri.query({k1: ""}).toString(), "?k1=");
    exam.equal(Uri.query({"": "v1"}).toString(), "?=v1");
    exam.equal(Uri.query({"": ""}).toString(), "?=");
    exam.equal(Uri.query({$0: "a", $1: "b"}).toString(), "?a&b");
    exam.equal(Uri.query({$0: "a", a: "b", $2: "b"}).toString(), "?a&a=b&b");
    exam.equal(Uri.query({$0: "", $1: ""}).toString(), "?&");
  }

  @Test
  writeURIsWithQueriesContainingPermittedDelimeters(exam: Exam): void {
    exam.equal(Uri.query({$0: "!$()*+,/:;?@'"}).toString(), "?!$()*+,/:;?@'");
  }

  @Test
  writeURIsWithQueryPartsContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.query({$0: "a?b?c"}).toString(), "?a?b?c");
  }

  @Test
  writeURIsWithEmptyFragments(exam: Exam): void {
    exam.equal(Uri.fragmentIdentifier("").toString(), "#");
  }

  @Test
  writeURIsWithFragmentIdentifiers(exam: Exam): void {
    exam.equal(Uri.fragmentIdentifier("fragment").toString(), "#fragment");
  }

  @Test
  writeURIsWithFragmentsContainingPermittedDelimeters(exam: Exam): void {
    exam.equal(Uri.fragmentIdentifier("!$&()*+,/:;?@='").toString(), "#!$&()*+,/:;?@='");
  }

  @Test
  writeURIsWithFragmentsContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.fragmentIdentifier("##").toString(), "#%23%23");
    exam.equal(Uri.fragmentIdentifier("a#b#c").toString(), "#a%23b%23c");
  }

  @Test
  writeURIsWithSchemesAndAuthorities(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withHostName("domain").toString(), "scheme://domain");
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).toString(), "scheme://domain:80");
    exam.equal(Uri.schemeName("scheme").withUsername("user").withHostName("domain").toString(), "scheme://user@domain");
    exam.equal(Uri.schemeName("scheme").withUsername("user").withHostName("domain").withPortNumber(80).toString(), "scheme://user@domain:80");
  }

  @Test
  writeURIsWithSchemesAndAbsolutePaths(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withPath("/").toString(), "scheme:/");
    exam.equal(Uri.schemeName("scheme").withPath("/", "one").toString(), "scheme:/one");
    exam.equal(Uri.schemeName("scheme").withPath("/", "one", "/").toString(), "scheme:/one/");
    exam.equal(Uri.schemeName("scheme").withPath("/", "one", "/", "two").toString(), "scheme:/one/two");
    exam.equal(Uri.schemeName("scheme").withPath("/", "one", "/", "two", "/").toString(), "scheme:/one/two/");
  }

  @Test
  writeURIsWithSchemesAndRelativePaths(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withPath("one").toString(), "scheme:one");
    exam.equal(Uri.schemeName("scheme").withPath("one", "/").toString(), "scheme:one/");
    exam.equal(Uri.schemeName("scheme").withPath("one", "/", "two").toString(), "scheme:one/two");
    exam.equal(Uri.schemeName("scheme").withPath("one", "/", "two", "/").toString(), "scheme:one/two/");
  }

  @Test
  writeURIsWithSchemesAndQueries(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withQuery({$0: "query"}).toString(), "scheme:?query");
    exam.equal(Uri.schemeName("scheme").withQuery({key: "value"}).toString(), "scheme:?key=value");
  }

  @Test
  writeURIsWithSchemesAndFragments(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withFragmentIdentifier("fragment").toString(), "scheme:#fragment");
  }

  @Test
  writeURIsWithSchemesAuthoritiesAndPaths(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").toString(), "scheme://domain/path");
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").toString(), "scheme://domain:80/path");
  }

  @Test
  writeURIsWithSchemesAuthoritiesAndQueries(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withQuery({$0: "query"}).toString(), "scheme://domain?query");
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withQuery({$0: "query"}).toString(), "scheme://domain:80?query");
  }

  @Test
  writeURIsWithSchemesAuthoritiesAndFragments(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withFragmentIdentifier("fragment").toString(), "scheme://domain#fragment");
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withFragmentIdentifier("fragment").toString(), "scheme://domain:80#fragment");
  }

  @Test
  writeURIsWithSchemesAuthoritiesPathsAndQueries(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withQuery({$0: "query"}).toString(), "scheme://domain/path?query");
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withQuery({$0: "query"}).toString(), "scheme://domain:80/path?query");
  }

  @Test
  writeURIsWithSchemesAuthoritiesPathsAndFragments(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withFragmentIdentifier("fragment").toString(), "scheme://domain/path#fragment");
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withFragmentIdentifier("fragment").toString(), "scheme://domain:80/path#fragment");
  }

  @Test
  writeURIsWithSchemesAuthoritiesPathsQueriesAndFragments(exam: Exam): void {
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withQuery({$0: "query"}).withFragmentIdentifier("fragment").toString(), "scheme://domain/path?query#fragment");
    exam.equal(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withQuery({$0: "query"}).withFragmentIdentifier("fragment").toString(), "scheme://domain:80/path?query#fragment");
  }
}
