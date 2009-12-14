(function($) {

if (typeof(Socialtext) == 'undefined')
    window.Socialtext = {};

Socialtext.Signals = function(vars) {
    $.extend(this, vars);
}

Socialtext.Signals.prototype = {
    // Default values
    host: "https://www.socialtext.net",
    latest: 0,

    // Privates
    _events: [],

    url: function(args) {
        var url = this.host + '/data/events';
        var arglist = [];
        $.each(args || {}, function(k,v) {
            if (k && v) arglist.push(k + '=' + v);
        });
        return url + (arglist.length ? '?' + arglist.join(';') : '');
    },

    fetch: function(cb) {
        var self = this;
        $.ajax({
            url: self.url({
                event_class: 'signal',
                after: (this._events.length ? this._events[0].at : undefined)
            }),
            type: 'GET',
            dataType: 'json',
            success: function(events) {
                if (events.length) {
                    $.each(events.reverse(), function(i,e) {
                        e.signal_id = Number(e.signal_id);
                        self._events.unshift(e);
                    });
                    self.updateCount();
                    if ($.isFunction(cb)) cb()
                }
            },
            error: function(xhr, statusText, errorThrown) {
                if ($.isFunction(self.error)) {
                    var err = xhr ? xhr.responseText : errorThrown;
                    self.onError(err || errorThrown || "Unknown error");
                }
            }
        });
    },

    getLatest: function() {
        this.latest;
    },

    seenAll: function() {
        this.latest = this._events[0].signal_id;
        if (this.onSetLatest) {
            this.onSetLatest(this.latest);
        }
        this.updateCount();
    },

    updateCount: function() {
        if (this.onUpdateCount) {
            this.onUpdateCount( this.newSince(this.latest) );
        }
    },

    newSince: function(latest) {
        var self = this;
        return $.grep(self._events, function(e) {
            return e.signal_id > latest;
        }).length;
    },

    post: function(text, cb) {
        var self = this;
        $.ajax({
            url: self.host + '/data/signals',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ signal: text }),
            success: function() {
                self.fetch(cb);
            },
            error: function() {
                var err = xhr ? xhr.responseText : errorThrown;
                alert(err || errorThrown || "Unknown error");
            }
        });
    },

    reply: function(user_id) {
        if ($.isFunction(this.onReply)) {
            this.onReply(user_id);
        }
    },

    html: function(latest) {
        if (!this._events.length) return "No signals";
        var html = 
            Jemplate.process('events.tt2', {
                events: this._events,
                latest: latest || this.latest
            })
            .replace(/src="\//g, 'src="' + this.host + '/')
            .replace(/href="\//g, 'href="' + this.host + '/')
            .replace(/<a/g,'<a target="_new"');
        this.updateCount();
        return html;
    },

    startTimer: function() {
        var self = this;
        self.fetch();
        setTimeout(function(){ self.startTimer() }, 15000);
    }
};

})(jQuery);
