(function()
{
    /// This module is an intermediary between non-background scripts and the bookmarks manger
    /// background script.

    const this_module = { MESSAGE_TYPE: "bookmarks_interface" };

    ["add", "contains_url", "get_front_id", "get_front_node",
     "needs_setup", "authenticate", "load",
     "clear", "setup", "change_authentication",
     "lock", "unlock", "is_locked", "is_unlocked"]
    .forEach(method_name =>
    {
        this_module[method_name] = (...arguments) =>
        {
            return browser.runtime.sendMessage({
                type: this_module.MESSAGE_TYPE,
                method_name: method_name,
                arguments:   arguments
            });
        }
    });
    ["events"].forEach(property_name =>
    {
        this_module[property_name] = () =>
        {
            return browser.runtime.sendMessage({
                type: this_module.MESSAGE_TYPE,
                property_name: property_name
            });
        }
    });

    define(this_module);
})();
