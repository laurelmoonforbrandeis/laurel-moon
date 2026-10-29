// Settings shared by every issue file in this folder.
// Each issue gets a page at /issues/<file-name>/, e.g. /issues/spring-2026/
export default {
  layout: "issue.njk",
  tags: "issues",
  eleventyComputed: {
    permalink: (data) => `/issues/${data.page.fileSlug}/`,
    description: (data) =>
      data.intro || `The ${data.title} issue of Laurel Moon: poetry, prose, and artwork by undergraduate writers and artists.`,
    ogImage: (data) => data.cover_image || data.ogImage,
  },
};
