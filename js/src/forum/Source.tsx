import app from 'flarum/app';
import highlight from 'flarum/common/helpers/highlight';
import LinkButton from 'flarum/common/components/LinkButton';
import Link from 'flarum/common/components/Link';
import { SearchSource } from 'flarum/forum/components/Search';
import type Mithril from 'mithril';

/**
 * The `DiscussionsSearchSource` finds and displays discussion search results in
 * the search dropdown.
 */
export default class Source implements SearchSource {
  protected results = new Map<string, unknown[]>();

  search(query: string) {
    query = query.toLowerCase();

    this.results.set(query, []);

    const params = {
      filter: { q: query },
      page: { limit: 3 },
      include: 'mostRelevantPost',
    };

    return app.request(app.forum.attribute('apiUrl') + '/blomstra/search', params).then((results) => this.results.set(query, results));
  }

  view(query: string): Array<Mithril.Vnode> {
    query = query.toLowerCase();

    const results = (this.results.get(query) || []).map((discussion: unknown) => {
      const mostRelevantPost = discussion.mostRelevantPost();

      return (
        <li className="DiscussionSearchResult" data-index={'discussions' + discussion.id()}>
          <Link href={app.route.discussion(discussion, mostRelevantPost && mostRelevantPost.number())}>
            <div className="DiscussionSearchResult-title">{highlight(discussion.title(), query)}</div>
            {mostRelevantPost ? <div className="DiscussionSearchResult-excerpt">{highlight(mostRelevantPost.contentPlain(), query, 100)}</div> : ''}
          </Link>
        </li>
      );
    }) as Array<Mithril.Vnode>;

    return [
      <li className="Dropdown-header">{app.translator.trans('core.forum.search.discussions_heading')}</li>,
      <li>
        <LinkButton icon="fas fa-search" href={app.route('index', { q: query })}>
          {app.translator.trans('core.forum.search.all_discussions_button', { query })}
        </LinkButton>
      </li>,
      ...results,
    ];
  }
}
