// Page titles and descriptions for each poem, story, and artwork page.
export default {
  eleventyComputed: {
    title: (data) => (data.piece ? data.piece.title : data.title),
    description: (data) =>
      data.piece
        ? `${data.piece.genre} by ${data.piece.author}, from the ${data.piece.issueTitle} issue of Laurel Moon.`
        : data.description,
    ogImage: (data) => (data.piece && data.piece.image ? data.piece.image : data.ogImage),
  },
};
