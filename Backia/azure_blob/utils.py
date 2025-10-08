def get_blob_url(blob_service, blob_name):
    """
    Construye la URL del blob dado su nombre y un servicio AzureBlobService.
    """
    return blob_service.container.get_blob_client(blob_name).url