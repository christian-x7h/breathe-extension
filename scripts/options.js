chrome.storage.sync.get('activeDomains', (result) => {
    const activeDomains = result.activeDomains;
    if (activeDomains && activeDomains.length > 0) {
        $('#domains').val(activeDomains.join(', '))
    }
});

$('#button').on('click', () => {    
    const domainsArray = $('#domains').val().split(',');
    // trim whitespace from every item in array
    const trimmedDomainsArray = domainsArray.map((domain) => {
        return domain.trim();
    });
    if (trimmedDomainsArray.length > 0) {
        chrome.storage.sync.set({ activeDomains: trimmedDomainsArray }, () => {
            $('#button').text('Saved!');
            setTimeout(() => {
                $('#button').text('Save');
            }, 1000);
        });
    }
});
