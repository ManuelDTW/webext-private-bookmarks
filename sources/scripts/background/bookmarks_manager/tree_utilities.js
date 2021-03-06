(function()
{
    /// Computes the number of nodes in the specified tree.
    function compute_size(node)
    {
        if (!node.children) { return 1; }
        else
        {
            return node.children.reduce((sum, child) => sum + compute_size(child), 1)
        }
    }
    /// Removes properties we are not interested in saving from the specified tree recursively.
    function prune(node)
    {
        delete node.index;
        delete node.dateAdded;
        delete node.dateGroupModified;
        delete node.unmodifiable;

        if (node.children) { node.children.forEach(child => prune(child)); }

        return node;
    }
    /// Imports all descendants of the specified source node to their respective position in the
    /// specified target node. The nodes are bookmark tree nodes.
    ///
    /// Invokes the specified callback for each new node created.
    async function duplicate(source_root, target_root, on_created)
    {
        if (!source_root.children) { return; }

        // This object maps source node identifiers to their target nodes.
        const target_by_id = {}; target_by_id[source_root.id] = target_root;

        // Traverse source using iterative DFS and import nodes.
        // Since the target root already exists, we skip a visit to the source root and begin our
        // traversal with its children.
        //
        // Also, since browser.bookmarks.create() prepends new nodes rather than appends, to
        // preserve original ordering we visit children in their reverse order.
        const stack = source_root.children.slice().reverse();
        while (stack.length !== 0)
        {
            const source = stack.pop(),
                  target_parent = target_by_id[source.parentId];

            target_by_id[source.id] = await browser.bookmarks.create(
            {
                parentId: target_parent.id,
                title:    source.title,
                url:      source.url
            });
            on_created();

            if (source.children)
            {
                // Since browser.bookmarks.create() prepends new nodes rather than appends, to
                // preserve original ordering we visit children in their reverse order.
                const children = source.children;
                for (let i = children.length - 1; i >= 0; --i) { stack.push(children[i]); }
            }
        }
    }

    define({
                compute_size: compute_size,
                duplicate: duplicate,
                prune: prune
           })
})();
