.PHONY: all clean

JEMPLATES=$(wildcard jemplate/*.tt2)
TEMPLATES=$(wildcard template/*.tt2)
HTML=$(TEMPLATES:template/%.tt2=%)
JS=javascript/jemplate.js javascript/jemplates.js

all: $(HTML) $(JS)

clean:
	rm -f $(HTML) $(JS)

%.html: $(JS) css/styles.css template/%.html.tt2 javascript/*
	perl -MTemplate -e 'Template->new->process("template/$@.tt2")' > $@

javascript/jemplate.js:
	jemplate --runtime=jquery > $@

javascript/jemplates.js: $(JEMPLATES)
	jemplate --compile $(JEMPLATES) > $@
