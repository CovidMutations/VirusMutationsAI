// import {NgModule} from '@angular/core';
// import {ApolloModule, APOLLO_OPTIONS} from 'apollo-angular';
// import {HttpLinkModule, HttpLink} from 'apollo-angular-link-http';
// import {InMemoryCache} from 'apollo-cache-inmemory';

// const uri = 'http://localhost:3000/graphql'; // <-- add the URL of the GraphQL server here

// @NgModule({
//   exports: [ApolloModule, HttpLinkModule],
//   providers: [
//     {
//       provide: APOLLO_OPTIONS,
//       useFactory: (httpLink: HttpLink) => {
//         return {
//           link: httpLink.create({uri}),
//           cache: new InMemoryCache(),
//         };
//       },
//       deps: [HttpLink],
//     },
//   ],
// })
// export class GraphQLModule {}
