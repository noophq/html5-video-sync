#!/bin/sh
set -e

case ${1} in
    app:start)
    # Replace base url in index.html
    BASE_URL=${BASE_URL:-"/"}
    sed "s|%%BASE_URL%%|${BASE_URL}|" /usr/local/apache2/htdocs/index.html.template > /usr/local/apache2/htdocs/index.html

    # Execute apache
    exec "httpd-foreground"
    ;;
    app:help)
        echo "Available options:"
        echo " app:start        - Starts the application (default)"
        echo " app:help         - Displays the help"
        echo " [command]        - Execute the specified command, eg. bash."
        ;;
    *)
        exec "$@"
        ;;
esac
