export const search_params_to_string = (
    params: Record<string, string>
) => new URLSearchParams(params).toString()